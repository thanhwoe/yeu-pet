import dayjs from "dayjs";
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
