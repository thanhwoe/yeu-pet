import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { OtpTokensRepository } from './otp-tokens.repository';
import { SendOtpJobParams } from '@app/interfaces/otp.interface';
import { OTP_JOBS } from './otp.job';
import { QueueService } from '../queue/queue.service';
import type { SupportedLanguage } from '../localization/localization.types';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpTokensRepository: OtpTokensRepository,
    private readonly queueService: QueueService,
  ) {}

  private generateOtp(): string {
    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  private async addSendOtpJob({ jobName, ...jobData }: SendOtpJobParams) {
    return this.queueService.dispatchOtp({ jobName, ...jobData });
  }

  async sendOtpToMobile(phone: string): Promise<string> {
    const otp = this.generateOtp();

    await this.addSendOtpJob({
      jobName: OTP_JOBS.SEND_OTP_PHONE,
      token: otp,
      phone,
    });

    return otp;
  }

  async sendOtpToEmail(
    email: string,
    userName: string,
    language?: SupportedLanguage,
  ): Promise<string> {
    const otp = this.generateOtp();

    await this.addSendOtpJob({
      jobName: OTP_JOBS.SEND_OTP_EMAIL,
      token: otp,
      email,
      language,
      userName,
    });

    return otp;
  }

  async findByUserId(userId: string) {
    return this.otpTokensRepository.findByUserId(userId);
  }
  async revokeToken(userId: string, token: string) {
    return this.otpTokensRepository.revokeToken(userId, token);
  }

  async upsertToken(userId: string, token: string) {
    return this.otpTokensRepository.upsertToken(userId, token);
  }

  async deleteExpired() {
    return this.otpTokensRepository.deleteExpired();
  }
}
