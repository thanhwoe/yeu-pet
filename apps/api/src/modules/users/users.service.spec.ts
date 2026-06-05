import { ConflictException } from '@nestjs/common';
import { IUsersRepository } from '@app/interfaces/users-repository.interface';
import { Test } from '@nestjs/testing';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { OtpService } from '../shared/otp/otp.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const usersRepository = {
    delete: jest.fn(),
    existsByEmail: jest.fn(),
    findAccount: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
  const otpService = {};
  const fileUploadService = {
    addDeleteJob: jest.fn(),
    addUploadJob: jest.fn(),
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
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('updates profile fields after checking email uniqueness', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
    });
    usersRepository.existsByEmail.mockResolvedValue(false);
    usersRepository.update.mockResolvedValue({ id: 'account-1' });

    await service.updateProfile('account-1', {
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'Name',
    });

    expect(usersRepository.existsByEmail).toHaveBeenCalledWith(
      'new@example.com',
    );
    expect(usersRepository.update).toHaveBeenCalledWith('account-1', {
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'Name',
    });
  });

  it('rejects profile update when email already exists', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      email: 'old@example.com',
    });
    usersRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      service.updateProfile('account-1', {
        email: 'new@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
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

  it('deactivates an account after password confirmation', async () => {
    usersRepository.findAccount.mockResolvedValue({
      id: 'account-1',
      is_active: true,
      password_hash:
        '$2b$10$/JvMnDPVgbzT9MaxlEp3Num64usBICywAdHAR0AdQGm2CwGu4BbC6',
    });

    await service.deactivateAccount('account-1', 'password123');

    expect(usersRepository.delete).toHaveBeenCalledWith('account-1');
  });
});
