import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUsersRepository } from '@app/interfaces/users-repository.interface';
import { Test } from '@nestjs/testing';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { OtpService } from '../shared/otp/otp.service';
import { EmailService } from '../shared/email/email.service';
import { LocalizationService } from '../shared/localization/localization.service';
import { EmailChangeRequestsRepository } from './email-change-requests.repository';
import { UsersService } from './users.service';
import { AccountDeletionBlockedByActiveBookingsError } from './users.repository';

describe('UsersService', () => {
  const usersRepository = {
    delete: jest.fn(),
    deleteAccountData: jest.fn(),
    existsByEmail: jest.fn(),
    findByEmail: jest.fn(),
    findAccount: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
  const otpService = {};
  const fileUploadService = {
    addDeleteJob: jest.fn(),
    addUploadJob: jest.fn(),
  };
  const emailService = {
    sendEmailChangeOtpEmail: jest.fn(),
  };
  const emailChangeRequestsRepository = {
    cancelPendingForAccount: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    incrementAttempts: jest.fn(),
    update: jest.fn(),
    updateForResend: jest.fn(),
    verifyAndUpdateAccountEmail: jest.fn(),
  };
  const localizationService = {
    resolveLanguageForAccount: jest.fn(() => Promise.resolve('en')),
  };

  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: IUsersRepository, useValue: usersRepository },
        { provide: OtpService, useValue: otpService },
        { provide: FileUploadService, useValue: fileUploadService },
        { provide: EmailService, useValue: emailService },
        {
          provide: EmailChangeRequestsRepository,
          useValue: emailChangeRequestsRepository,
        },
        { provide: LocalizationService, useValue: localizationService },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('updates profile name fields without allowing direct email change', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
    });
    usersRepository.update.mockResolvedValue({ id: 'account-1' });

    await service.updateProfile('account-1', {
      // @ts-expect-error email is intentionally ignored when legacy clients send it
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'Name',
    });

    expect(usersRepository.existsByEmail).not.toHaveBeenCalled();
    expect(usersRepository.update).toHaveBeenCalledWith('account-1', {
      first_name: 'New',
      last_name: 'Name',
    });
  });

  it('rejects email change request when the email belongs to another account', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
    });
    usersRepository.findByEmail.mockResolvedValue({ id: 'account-2' });

    await expect(
      service.requestEmailChange('account-1', {
        newEmail: 'new@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates email change request and sends OTP to the new email', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
      first_name: 'Thanh',
      last_name: 'Nguyen',
    });
    usersRepository.findByEmail.mockResolvedValue(null);
    emailChangeRequestsRepository.create.mockResolvedValue({
      id: 'request-1',
      new_email: 'new@example.com',
      expires_at: new Date('2026-06-11T09:50:00.000Z'),
      last_sent_at: new Date('2026-06-11T09:40:00.000Z'),
    });

    const result = await service.requestEmailChange('account-1', {
      newEmail: ' NEW@example.com ',
    });

    expect(
      emailChangeRequestsRepository.cancelPendingForAccount,
    ).toHaveBeenCalledWith('account-1');
    expect(emailChangeRequestsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'account-1',
        newEmail: 'new@example.com',
      }),
    );
    expect(emailService.sendEmailChangeOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@example.com',
        expiresInMinutes: 10,
        language: 'en',
        userName: 'Thanh Nguyen',
      }),
    );
    expect(result).toMatchObject({
      requestId: 'request-1',
      newEmail: 'new@example.com',
      maskedEmail: 'ne**@example.com',
    });
  });

  it('does not allow requesting the current email', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
    });

    await expect(
      service.requestEmailChange('account-1', {
        newEmail: ' OLD@example.com ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects wrong email change OTP and increments attempts', async () => {
    emailChangeRequestsRepository.findById.mockResolvedValue({
      id: 'request-1',
      account_id: 'account-1',
      new_email: 'new@example.com',
      otp_hash: await bcrypt.hash('123456', 4),
      attempts: 0,
      status: 'pending',
      expires_at: new Date(Date.now() + 60_000),
    });
    emailChangeRequestsRepository.incrementAttempts.mockResolvedValue({
      attempts: 1,
    });

    await expect(
      service.verifyEmailChange('account-1', {
        requestId: 'request-1',
        otp: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(
      emailChangeRequestsRepository.incrementAttempts,
    ).toHaveBeenCalledWith('request-1');
  });

  it('verifies OTP and updates account email after re-checking uniqueness', async () => {
    emailChangeRequestsRepository.findById.mockResolvedValue({
      id: 'request-1',
      account_id: 'account-1',
      new_email: 'new@example.com',
      otp_hash: await bcrypt.hash('123456', 4),
      attempts: 0,
      status: 'pending',
      expires_at: new Date(Date.now() + 60_000),
    });
    usersRepository.findByEmail.mockResolvedValue(null);
    emailChangeRequestsRepository.verifyAndUpdateAccountEmail.mockResolvedValue(
      {
        id: 'account-1',
        email: 'new@example.com',
      },
    );

    const result = await service.verifyEmailChange('account-1', {
      requestId: 'request-1',
      otp: '123456',
    });

    expect(
      emailChangeRequestsRepository.verifyAndUpdateAccountEmail,
    ).toHaveBeenCalledWith({
      requestId: 'request-1',
      accountId: 'account-1',
      newEmail: 'new@example.com',
    });
    expect(result).toEqual({
      account: { id: 'account-1', email: 'new@example.com' },
    });
  });

  it('does not allow another account to cancel a request', async () => {
    emailChangeRequestsRepository.findById.mockResolvedValue({
      id: 'request-1',
      account_id: 'account-2',
    });

    await expect(
      service.cancelEmailChange('account-1', { requestId: 'request-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('queues avatar upload under the user folder', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      avatar_id: 'old-avatar',
    });
    usersRepository.findById.mockResolvedValue({ id: 'account-1' });

    await service.uploadAvatar('account-1', {
      originalname: 'avatar.png',
    } as Express.Multer.File);

    expect(fileUploadService.addUploadJob).toHaveBeenCalledWith({
      jobName: FILE_UPLOAD_JOBS.USER_AVATAR,
      files: [
        {
          file: {
            originalname: 'avatar.png',
          },
          id: 'old-avatar',
          folder: 'users/account-1',
        },
      ],
      itemId: 'account-1',
      userId: 'account-1',
    });
  });

  it('clears avatar fields and queues deletion for existing avatar', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      avatar_id: 'old-avatar',
    });
    usersRepository.update.mockResolvedValue({
      id: 'account-1',
      avatar_url: null,
    });

    await service.deleteAvatar('account-1');

    expect(usersRepository.update).toHaveBeenCalledWith('account-1', {
      avatar_id: null,
      avatar_url: null,
    });
    expect(fileUploadService.addDeleteJob).toHaveBeenCalledWith({
      ids: ['old-avatar'],
      jobName: FILE_DELETE_JOBS.USER_AVATAR,
    });
  });

  it('deletes an account after password confirmation', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      is_active: true,
      password_hash:
        '$2b$10$/JvMnDPVgbzT9MaxlEp3Num64usBICywAdHAR0AdQGm2CwGu4BbC6',
    });
    usersRepository.deleteAccountData.mockResolvedValue({
      files: {
        medicalRecordIds: [],
        notificationImageIds: [],
        petAvatarIds: [],
        photoIds: [],
        userAvatarIds: [],
      },
    });

    await service.deleteAccount('account-1', { password: 'password123' });

    expect(usersRepository.deleteAccountData).toHaveBeenCalledTimes(1);
    expect(usersRepository.deleteAccountData).toHaveBeenCalledWith(
      'account-1',
      expect.anything(),
    );
    expect(usersRepository.delete).not.toHaveBeenCalled();
  });

  it('blocks account deletion when active sitter bookings exist', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      is_active: true,
      password_hash:
        '$2b$10$/JvMnDPVgbzT9MaxlEp3Num64usBICywAdHAR0AdQGm2CwGu4BbC6',
    });
    usersRepository.deleteAccountData.mockRejectedValue(
      new AccountDeletionBlockedByActiveBookingsError(1),
    );

    try {
      await service.deleteAccount('account-1', { password: 'password123' });
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      const response = (error as ConflictException).getResponse();
      expect(response).toMatchObject({
        errorCode: 'ACCOUNT_DELETION_ACTIVE_BOOKINGS',
        message:
          'Account cannot be deleted while you have active bookings. Please complete or cancel your bookings first.',
        messageKey: 'errors.accountDeletion.activeBookings',
      });
      return;
    }

    throw new Error('Expected account deletion to be blocked');
  });
});
