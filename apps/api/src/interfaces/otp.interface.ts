import type { SupportedLanguage } from '@app/modules/shared/localization/localization.types';

export interface OtpJobData {
  phone?: string;
  email?: string;
  language?: SupportedLanguage;
  userName?: string;
  token: string;
}

export interface SendOtpJobParams extends OtpJobData {
  jobName: string;
}
