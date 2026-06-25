import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import advancedFormat from "dayjs/plugin/advancedFormat";
import calendar from "dayjs/plugin/calendar";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import { LocaleConfig } from "react-native-calendars";

import { type SupportedLanguage } from "@/i18n/languages";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(localeData);
dayjs.extend(relativeTime);
dayjs.extend(weekday);
dayjs.extend(calendar);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

export const date = dayjs;

const TODAY_COPY: Record<SupportedLanguage, string> = {
  en: "Today",
  vi: "Hôm nay",
};

export const setAppDateLocale = (language: SupportedLanguage) => {
  date.locale(language);

  LocaleConfig.locales[language] = {
    monthNames: date.months(),
    monthNamesShort: date.monthsShort(),
    dayNames: date.weekdays(),
    dayNamesShort: date.weekdaysShort(),
    today: TODAY_COPY[language],
  };
  LocaleConfig.defaultLocale = language;
};
