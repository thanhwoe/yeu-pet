import i18n from "i18next";
import { initReactI18next, setI18n } from "react-i18next";

import { setAppDateLocale } from "@/utils/dayjsConfig";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  detectDeviceLanguage,
  normalizeLanguage,
  type SupportedLanguage,
} from "./languages";
import en from "./resources/en.json";
import vi from "./resources/vi.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

const initialLanguage = detectDeviceLanguage();
setAppDateLocale(initialLanguage);
setI18n(i18n);

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    lng: initialLanguage,
    react: {
      useSuspense: false,
    },
    resources,
    returnNull: false,
    supportedLngs: SUPPORTED_LANGUAGES,
  });
}

export const getCurrentLanguage = (): SupportedLanguage =>
  normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

export const changeAppLanguage = async (
  language: string | null | undefined,
): Promise<SupportedLanguage> => {
  const nextLanguage = normalizeLanguage(language);

  setAppDateLocale(nextLanguage);
  if (getCurrentLanguage() !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage);
  }

  return nextLanguage;
};

export {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  SUPPORTED_LANGUAGES,
  detectDeviceLanguage,
  normalizeLanguage,
  type SupportedLanguage,
} from "./languages";

export { i18n };
