export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;
