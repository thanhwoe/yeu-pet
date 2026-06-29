import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';
import { accounts, email_change_status } from '@app/generated/prisma/client';
import { IUsersRepository } from '@app/interfaces/users-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import crypto from 'node:crypto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { OtpService } from '../shared/otp/otp.service';
import { EmailService } from '../shared/email/email.service';
import { LocalizationService } from '../shared/localization/localization.service';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';
import {
  CancelEmailChangeDto,
  RequestEmailChangeDto,
  ResendEmailChangeDto,
  VerifyEmailChangeDto,
} from './dto/email-change.dto';
import { EmailChangeRequestsRepository } from './email-change-requests.repository';
import { AccountDeletionBlockedByActiveBookingsError } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(IUsersRepository)
    private readonly usersRepository: IUsersRepository,
    private readonly otpService: OtpService,
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
    private readonly emailChangeRequestsRepository: EmailChangeRequestsRepository,
    private readonly localizationService: LocalizationService,
  ) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) return null;

    return user;
  }

  async findByEmailOrPhone(identifier: string): Promise<accounts | null> {
    return this.usersRepository.findByEmailOrPhone(identifier);
  }

  async create(data: CreateUserDto) {
    // Check duplicate phone
    const phoneExists = await this.usersRepository.existsByPhone(data.phone);
    if (phoneExists) {
      throw new ConflictException('Phone number already exists');
    }

    if (data.email) {
      const emailExists = await this.usersRepository.existsByEmail(data.email);
      if (emailExists) {
        throw new ConflictException({
          errorCode: API_ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
          message: 'Email already exists',
          messageKey: 'errors.auth.emailAlreadyExists',
        });
      }
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.usersRepository.create({
      password_hash: hashedPassword,
      phone: data.phone,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
    });

    await this.sendVerificationCode(user.id);

    return user;
  }

  async updateAccount(id: string, data: Partial<accounts>) {
    await this.getUser({ id });

    return this.usersRepository.update(id, data);
  }

  async verifyAccount(userId: string, token: string) {
    const user = await this.getUser({ id: userId });

    if (user.is_verified) {
      throw new BadRequestException('Account already verified');
    }

    const otpRecord = await this.otpService.findByUserId(userId);

    if (!otpRecord || !otpRecord.token) {
      throw new BadRequestException(
        'No OTP code found. Please request a new one.',
      );
    }

    if (dayjs().isAfter(otpRecord.expires_at)) {
      throw new BadRequestException({
        errorCode: API_ERROR_CODES.AUTH_OTP_EXPIRED,
        message: 'OTP code has expired',
        messageKey: 'errors.auth.otpExpired',
      });
    }

    if (token !== otpRecord.token) {
      throw new BadRequestException({
        errorCode: API_ERROR_CODES.AUTH_OTP_INVALID,
        message: 'Invalid OTP code',
        messageKey: 'errors.auth.otpInvalid',
      });
    }

    await this.otpService.revokeToken(userId, token);

    return this.usersRepository.update(userId, {
      is_verified: true,
    });
  }

  async resendVerificationCode(account_id: string) {
    const { expires_at } = await this.sendVerificationCode(account_id);

    return { expires_at };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.getUser({ id: userId });

    const isPasswordValid = await this.validatePassword(
      updatePasswordDto.currentPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await this.validatePassword(
      updatePasswordDto.newPassword,
      user.password_hash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }
    const hashedPassword = await this.hashPassword(
      updatePasswordDto.newPassword,
    );

    return this.usersRepository.update(userId, {
      password_hash: hashedPassword,
    });
  }

  async requestPasswordReset(dto: RequestResetPasswordDto) {
    const user = await this.getUser({ phone: dto.phone });

    const { expires_at } = await this.sendVerificationCode(user.id);

    return { expires_at, phone: user.phone };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.getUser({ phone: dto.phone });

    const otpRecord = await this.otpService.findByUserId(user.id);
    if (!otpRecord || otpRecord.token !== dto.code) {
      throw new BadRequestException({
        errorCode: API_ERROR_CODES.AUTH_OTP_INVALID,
        message: 'Invalid or expired OTP code',
        messageKey: 'errors.auth.otpInvalid',
      });
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);

    await this.usersRepository.update(user.id, {
      password_hash: hashedPassword,
    });

    await this.otpService.revokeToken(user.id, dto.code);

    return { message: 'Password reset successfully' };
  }

  async deactivateAccount(userId: string, password: string) {
    return this.deleteAccount(userId, { password });
  }

  async deleteAccount(userId: string, deleteUserDto: DeleteUserDto) {
    const user = await this.getUser({ id: userId });

    if (!user.is_active) {
      throw new BadRequestException('User is already deactivated');
    }

    const isPasswordValid = await this.validatePassword(
      deleteUserDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const passwordHash = await this.hashPassword(crypto.randomUUID());

    try {
      const result = await this.usersRepository.deleteAccountData(userId, {
        passwordHash,
      });
      await this.queueAccountDeletionFileCleanup(result.files);
    } catch (error) {
      if (error instanceof AccountDeletionBlockedByActiveBookingsError) {
        throw new ConflictException({
          errorCode: API_ERROR_CODES.ACCOUNT_DELETION_ACTIVE_BOOKINGS,
          message:
            'Account cannot be deleted while you have active bookings. Please complete or cancel your bookings first.',
          messageKey: 'errors.accountDeletion.activeBookings',
          params: {
            count: error.activeBookingCount,
          },
        });
      }

      throw error;
    }
  }

  async completeOnboarding(id: string) {
    const user = await this.getUser({ id });

    if (user.onboarding_completed) {
      throw new BadRequestException('User is already complete onboarding');
    }

    return this.usersRepository.update(id, {
      onboarding_completed: true,
    });
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    const user = await this.getUser({ id: userId });

    // Handle avatar upload
    if (avatarFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.USER_AVATAR,
        files: [
          {
            file: avatarFile,
            id: user.avatar_id,
            folder: `users/${userId}`,
          },
        ],
        itemId: userId,
        userId,
      });
    }

    // Update user information
    return this.usersRepository.update(userId, {
      first_name: updateProfileDto.firstName,
      last_name: updateProfileDto.lastName,
    });
  }

  async requestEmailChange(userId: string, dto: RequestEmailChangeDto) {
    const user = await this.getUser({ id: userId });
    const newEmail = this.normalizeEmail(dto.newEmail);

    if (this.normalizeEmail(user.email ?? '') === newEmail) {
      throw new BadRequestException(
        'New email must be different from current email',
      );
    }

    await this.assertEmailAvailable(newEmail, userId);
    await this.emailChangeRequestsRepository.cancelPendingForAccount(userId);

    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const now = new Date();
    const expiresInMinutes = this.getEmailOtpConfig(
      'EMAIL_OTP_EXPIRES_MINUTES',
      10,
    );
    const language =
      await this.localizationService.resolveLanguageForAccount(userId);
    const request = await this.emailChangeRequestsRepository.create({
      accountId: userId,
      newEmail,
      otpHash,
      expiresAt: dayjs(now).add(expiresInMinutes, 'minute').toDate(),
      lastSentAt: now,
    });

    try {
      await this.emailService.sendEmailChangeOtpEmail({
        to: newEmail,
        otp,
        expiresInMinutes,
        language,
        userName: [user.first_name, user.last_name].filter(Boolean).join(' '),
        idempotencyKey: `email-change-otp/${request.id}/initial`,
      });
    } catch (error) {
      await this.emailChangeRequestsRepository.update(request.id, {
        status: email_change_status.cancelled,
        cancelled_at: new Date(),
      });

      throw error;
    }

    return this.toEmailChangeResponse(request);
  }

  async verifyEmailChange(userId: string, dto: VerifyEmailChangeDto) {
    const request = await this.getPendingEmailChangeRequest(
      userId,
      dto.requestId,
    );
    const maxAttempts = this.getEmailOtpConfig('EMAIL_OTP_MAX_ATTEMPTS', 5);

    if (request.attempts >= maxAttempts) {
      throw this.tooManyRequests('Too many invalid OTP attempts');
    }

    const valid = await bcrypt.compare(dto.otp, request.otp_hash);

    if (!valid) {
      const updated =
        await this.emailChangeRequestsRepository.incrementAttempts(request.id);

      if (updated.attempts >= maxAttempts) {
        throw this.tooManyRequests('Too many invalid OTP attempts');
      }

      throw new BadRequestException({
        errorCode: API_ERROR_CODES.AUTH_OTP_INVALID,
        message: 'Invalid OTP code',
        messageKey: 'errors.auth.otpInvalid',
      });
    }

    await this.assertEmailAvailable(request.new_email, userId);
    const account =
      await this.emailChangeRequestsRepository.verifyAndUpdateAccountEmail({
        requestId: request.id,
        accountId: userId,
        newEmail: request.new_email,
      });

    return { account };
  }

  async resendEmailChange(userId: string, dto: ResendEmailChangeDto) {
    const request = await this.getPendingEmailChangeRequest(
      userId,
      dto.requestId,
    );
    const now = new Date();
    const cooldownSeconds = this.getEmailOtpConfig(
      'EMAIL_OTP_RESEND_COOLDOWN_SECONDS',
      60,
    );
    const maxResends = this.getEmailOtpConfig('EMAIL_OTP_MAX_RESENDS', 5);

    if (request.resend_count >= maxResends) {
      throw this.tooManyRequests('Maximum resend count reached');
    }

    const resendAvailableAt = request.last_sent_at
      ? dayjs(request.last_sent_at).add(cooldownSeconds, 'second')
      : null;

    if (resendAvailableAt && dayjs(now).isBefore(resendAvailableAt)) {
      throw this.tooManyRequests(
        `Please wait ${resendAvailableAt.diff(dayjs(now), 'second')} seconds before requesting a new code`,
      );
    }

    await this.assertEmailAvailable(request.new_email, userId);

    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresInMinutes = this.getEmailOtpConfig(
      'EMAIL_OTP_EXPIRES_MINUTES',
      10,
    );
    const updated = await this.emailChangeRequestsRepository.updateForResend({
      id: request.id,
      otpHash,
      expiresAt: dayjs(now).add(expiresInMinutes, 'minute').toDate(),
      lastSentAt: now,
    });

    try {
      const user = await this.getUser({ id: userId });
      const language =
        await this.localizationService.resolveLanguageForAccount(userId);
      await this.emailService.sendEmailChangeOtpEmail({
        to: updated.new_email,
        otp,
        expiresInMinutes,
        language,
        userName: [user.first_name, user.last_name].filter(Boolean).join(' '),
        idempotencyKey: `email-change-otp/${updated.id}/resend-${updated.resend_count}`,
      });
    } catch (error) {
      await this.emailChangeRequestsRepository.update(updated.id, {
        status: email_change_status.cancelled,
        cancelled_at: new Date(),
      });

      throw error;
    }

    return this.toEmailChangeResponse(updated);
  }

  async cancelEmailChange(userId: string, dto: CancelEmailChangeDto) {
    const request = await this.emailChangeRequestsRepository.findById(
      dto.requestId,
    );

    if (!request || request.account_id !== userId) {
      throw new NotFoundException('Email change request not found');
    }

    if (request.status !== email_change_status.pending) {
      return this.toEmailChangeResponse(request);
    }

    const updated = await this.emailChangeRequestsRepository.update(
      request.id,
      {
        status: email_change_status.cancelled,
        cancelled_at: new Date(),
      },
    );

    return this.toEmailChangeResponse(updated);
  }

  async uploadAvatar(userId: string, avatarFile: Express.Multer.File) {
    const user = await this.getUser({ id: userId });

    await this.fileUploadService.addUploadJob({
      jobName: FILE_UPLOAD_JOBS.USER_AVATAR,
      files: [
        {
          file: avatarFile,
          id: user.avatar_id,
          folder: `users/${userId}`,
        },
      ],
      itemId: userId,
      userId,
    });

    return {
      queued: true,
      profile: await this.findById(userId),
    };
  }

  async deleteAvatar(userId: string) {
    const user = await this.getUser({ id: userId });

    const profile = await this.usersRepository.update(userId, {
      avatar_id: null,
      avatar_url: null,
    });

    if (user.avatar_id) {
      await this.fileUploadService.addDeleteJob({
        ids: [user.avatar_id],
        jobName: FILE_DELETE_JOBS.USER_AVATAR,
      });
    }

    return profile;
  }

  private async getUser({
    email,
    id,
    phone,
  }: {
    id?: string;
    phone?: string;
    email?: string;
  }) {
    let user: accounts | null = null;

    if (id) {
      user = await this.usersRepository.findAccount(id);
    }

    if (email) {
      user = await this.usersRepository.findByEmail(email);
    }

    if (phone) {
      user = await this.usersRepository.findByPhone(phone);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async sendVerificationCode(userId: string) {
    const user = await this.getUser({ id: userId });

    const otpRecord = await this.otpService.findByUserId(user.id);

    if (otpRecord && dayjs().isBefore(otpRecord.expires_at)) {
      const wait = dayjs(otpRecord.expires_at).diff(dayjs(), 'second');

      throw new BadRequestException(
        `Please wait ${wait} seconds before requesting a new code`,
      );
    }

    // const otp = await this.otpService.sendOtpToEmail(
    //   user.email ?? 'thanhwoe@gmail.com',
    //   user.first_name ?? 'test',
    // );

    const otp = await this.otpService.sendOtpToMobile(user.phone);

    return this.otpService.upsertToken(userId, otp);
  }

  private async hashPassword(value: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(value, salt);
  }

  private async queueAccountDeletionFileCleanup(files: {
    medicalRecordIds: string[];
    notificationImageIds: string[];
    petAvatarIds: string[];
    photoIds: string[];
    userAvatarIds: string[];
  }) {
    const photoIds = [
      ...new Set([...files.photoIds, ...files.notificationImageIds]),
    ];
    const jobs = [
      {
        ids: files.userAvatarIds,
        jobName: FILE_DELETE_JOBS.USER_AVATAR,
      },
      {
        ids: files.petAvatarIds,
        jobName: FILE_DELETE_JOBS.PET_AVATAR,
      },
      {
        ids: files.medicalRecordIds,
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      },
      {
        ids: photoIds,
        jobName: FILE_DELETE_JOBS.PHOTOS,
      },
    ].filter((job) => job.ids.length > 0);

    try {
      await Promise.all(
        jobs.map((job) =>
          this.fileUploadService.addDeleteJob({
            ids: job.ids,
            jobName: job.jobName,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Account deletion completed but file cleanup could not be queued for account files: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async getPendingEmailChangeRequest(
    userId: string,
    requestId: string,
  ) {
    const request =
      await this.emailChangeRequestsRepository.findById(requestId);

    if (!request || request.account_id !== userId) {
      throw new NotFoundException('Email change request not found');
    }

    if (request.status !== email_change_status.pending) {
      throw new BadRequestException('Email change request is not pending');
    }

    if (dayjs().isAfter(request.expires_at)) {
      await this.emailChangeRequestsRepository.update(request.id, {
        status: email_change_status.expired,
      });

      throw new BadRequestException({
        errorCode: API_ERROR_CODES.AUTH_OTP_EXPIRED,
        message: 'OTP code has expired',
        messageKey: 'errors.auth.otpExpired',
      });
    }

    return request;
  }

  private async assertEmailAvailable(
    newEmail: string,
    currentAccountId: string,
  ) {
    const existing = await this.usersRepository.findByEmail(newEmail);

    if (existing && existing.id !== currentAccountId) {
      throw new ConflictException({
        errorCode: API_ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
        message: 'Email already exists',
        messageKey: 'errors.auth.emailAlreadyExists',
      });
    }
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private async hashOtp(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');

    if (!local || !domain) return email;

    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${'*'.repeat(Math.max(2, local.length - visible.length))}@${domain}`;
  }

  private getEmailOtpConfig(key: string, fallback: number): number {
    const value = process.env[key];
    const parsed = value ? Number(value) : NaN;

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private tooManyRequests(message: string) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  private toEmailChangeResponse(request: {
    id: string;
    new_email: string;
    expires_at: Date;
    last_sent_at: Date | null;
  }) {
    const cooldownSeconds = this.getEmailOtpConfig(
      'EMAIL_OTP_RESEND_COOLDOWN_SECONDS',
      60,
    );

    return {
      requestId: request.id,
      newEmail: request.new_email,
      maskedEmail: this.maskEmail(request.new_email),
      expiresAt: request.expires_at.toISOString(),
      resendAvailableAt: request.last_sent_at
        ? dayjs(request.last_sent_at)
            .add(cooldownSeconds, 'second')
            .toDate()
            .toISOString()
        : undefined,
    };
  }
}
