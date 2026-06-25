import { getLocales } from "expo-localization";

export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

export const LANGUAGE_OPTIONS = [
  { labelKey: "settings.language.vietnamese", value: "vi" },
  { labelKey: "settings.language.english", value: "en" },
] as const satisfies readonly {
  labelKey: string;
  value: SupportedLanguage;
}[];

export const normalizeLanguage = (
  language?: string | null,
): SupportedLanguage => {
  const normalized = language?.toLowerCase().replace("_", "-");
  const languageCode = normalized?.split("-")[0];

  return (
    SUPPORTED_LANGUAGES.find((item) => item === languageCode) ??
    DEFAULT_LANGUAGE
  );
};

export const detectDeviceLanguage = (): SupportedLanguage => {
  const [preferredLocale] = getLocales();

  return normalizeLanguage(
    preferredLocale?.languageTag ?? preferredLocale?.languageCode,
  );
};
