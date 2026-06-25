import { PrismaService } from '@app/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TRANSLATIONS } from './translations';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationParams,
} from './localization.types';

@Injectable()
export class LocalizationService {
  constructor(private readonly prisma: PrismaService) {}

  normalizeLanguage(value?: string | string[] | null): SupportedLanguage {
    const rawValue = Array.isArray(value) ? value.join(',') : value;

    if (!rawValue) return 'vi';

    const language = rawValue
      .split(',')
      .map((part) => part.split(';')[0]?.trim().toLowerCase())
      .find(Boolean);

    if (!language) return 'vi';
    if (language === 'vi' || language.startsWith('vi-')) return 'vi';
    if (language === 'en' || language.startsWith('en-')) return 'en';

    return 'vi';
  }

  translate(
    key: string,
    language: SupportedLanguage,
    params: TranslationParams = {},
  ): string {
    const normalizedLanguage = this.normalizeLanguage(language);
    const template =
      TRANSLATIONS[normalizedLanguage][key] ?? TRANSLATIONS.vi[key] ?? key;

    return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
      const value = params[name];
      return value === null || value === undefined ? '' : String(value);
    });
  }

  async resolveLanguageForAccount(
    accountId: string,
  ): Promise<SupportedLanguage> {
    const settings = await this.prisma.account_settings.findUnique({
      where: { account_id: accountId },
      select: { language: true },
    });

    return this.normalizeLanguage(settings?.language);
  }

  async resolveLanguage(params: {
    accountId?: string | null;
    acceptLanguage?: string | string[] | null;
  }): Promise<SupportedLanguage> {
    if (params.accountId) {
      return this.resolveLanguageForAccount(params.accountId);
    }

    return this.normalizeLanguage(params.acceptLanguage);
  }

  isSupportedLanguage(value: string): value is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
  }
}
