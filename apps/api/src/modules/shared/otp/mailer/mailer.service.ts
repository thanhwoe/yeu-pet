import { MailerService as MailerServiceOrg } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalizationService } from '../../localization/localization.service';
import type { SupportedLanguage } from '../../localization/localization.types';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: MailerServiceOrg,
    private readonly configService: ConfigService,
    private readonly localizationService: LocalizationService,
  ) {}

  async sendOtp(
    email: string,
    otp: string,
    userName: string,
    language?: SupportedLanguage,
  ) {
    const resolvedLanguage =
      this.localizationService.normalizeLanguage(language);
    const minutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5);
    const displayName =
      userName.trim() || (resolvedLanguage === 'vi' ? 'bạn' : 'there');

    try {
      await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: this.localizationService.translate(
          'emails.otp.subject',
          resolvedLanguage,
        ),
        template: './otp',
        context: {
          copy: {
            expiry: this.localizationService.translate(
              'emails.otp.expiry',
              resolvedLanguage,
              { minutes },
            ),
            greeting: this.localizationService.translate(
              'emails.otp.greeting',
              resolvedLanguage,
              { userName: displayName },
            ),
            heading: this.localizationService.translate(
              'emails.otp.heading',
              resolvedLanguage,
            ),
            ignore: this.localizationService.translate(
              'emails.otp.ignore',
              resolvedLanguage,
            ),
            intro: this.localizationService.translate(
              'emails.otp.intro',
              resolvedLanguage,
            ),
            support: this.localizationService.translate(
              'emails.otp.support',
              resolvedLanguage,
            ),
            title: this.localizationService.translate(
              'emails.otp.subject',
              resolvedLanguage,
            ),
          },
          otp,
        },
      });
      return otp;
    } catch {
      throw new Error('Failed to send OTP via email');
    }
  }
}
