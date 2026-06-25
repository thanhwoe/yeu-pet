import { date } from "./dayjsConfig";

type DateInput = Date | number | string | null | undefined;

const parseDate = (value: DateInput) => {
  if (!value) return null;

  const parsed = date(value);
  return parsed.isValid() ? parsed : null;
};

export const formatDate = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("L") ?? fallback;
};

export const formatDateTime = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("L LT") ?? fallback;
};

export const formatTime = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("LT") ?? fallback;
};

export const formatCompactDate = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("ddd, MMM D, YYYY") ?? fallback;
};

export const formatCompactDateTime = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("ddd, MMM D, LT") ?? fallback;
};

export const formatMonthYear = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.format("MMMM YYYY") ?? fallback;
};

export const formatRelativeTime = (value: DateInput, fallback = "") => {
  const parsed = parseDate(value);
  return parsed?.fromNow() ?? fallback;
};

export const formatSubscriptionDate = (value: DateInput) => {
  const parsed = parseDate(value);
  return parsed?.format("LL");
};

export const getLocalDayKey = (value: DateInput) => {
  const parsed = parseDate(value);
  return parsed?.format("YYYY-MM-DD");
};
