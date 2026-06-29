import { i18n } from "@/i18n";

const FIELD_TRANSLATION_KEYS: Record<string, string> = {
  Address: "validation.fields.address",
  Age: "validation.fields.age",
  Amount: "validation.fields.amount",
  Attachments: "validation.fields.attachments",
  Bio: "validation.fields.bio",
  Birthdate: "validation.fields.birthdate",
  Category: "validation.fields.category",
  City: "validation.fields.city",
  Color: "validation.fields.color",
  "Care instructions": "validation.fields.careInstructions",
  "Daily rate": "validation.fields.dailyRate",
  Date: "validation.fields.date",
  Description: "validation.fields.description",
  "Display name": "validation.fields.displayName",
  District: "validation.fields.district",
  Email: "validation.fields.email",
  Emoji: "validation.fields.emoji",
  "End time": "validation.fields.endTime",
  Experience: "validation.fields.experience",
  "First name": "validation.fields.firstName",
  "Hourly rate": "validation.fields.hourlyRate",
  "Last name": "validation.fields.lastName",
  Message: "validation.fields.message",
  Name: "validation.fields.name",
  "OTP code": "validation.fields.otpCode",
  "Owner notes": "validation.fields.ownerNotes",
  Password: "validation.fields.password",
  Pet: "validation.fields.pet",
  "Phone number": "validation.fields.phoneNumber",
  Rating: "validation.fields.rating",
  Reason: "validation.fields.reason",
  "Record type": "validation.fields.recordType",
  "Reminder name": "validation.fields.reminderName",
  Review: "validation.fields.review",
  Schedule: "validation.fields.schedule",
  "Service notes": "validation.fields.serviceNotes",
  "Service type": "validation.fields.serviceType",
  "Start time": "validation.fields.startTime",
  Title: "validation.fields.title",
  Type: "validation.fields.type",
  Ward: "validation.fields.ward",
};

const translate = (
  key: string,
  options?: Record<string, string | number>,
): string => String(i18n.t(key, options));

const translateField = (fieldName: string) => {
  const key = FIELD_TRANSLATION_KEYS[fieldName];

  return key ? translate(key) : fieldName;
};

export const ERROR_MESSAGE = {
  FIELD_INVALID: (fieldName: string) =>
    translate("validation.invalid", { field: translateField(fieldName) }),
  FIELD_REQUIRED: (fieldName: string) =>
    translate("validation.required", { field: translateField(fieldName) }),
  PASSWORD_CANNOT_BE_LESS_THAN_8_CHARACTERS: translate(
    "validation.passwordMin",
  ),
  FIELD_LENGTH: (fieldName: string, length: number) =>
    translate("validation.exactLength", {
      field: translateField(fieldName),
      length,
    }),
  NUMBER_ONLY: (fieldName: string) =>
    translate("validation.numbersOnly", { field: translateField(fieldName) }),
};

export const VALIDATION_MESSAGE = {
  BIRTHDATE_NOT_FUTURE: () => translate("validation.birthdateFuture"),
  DAILY_START_TOMORROW: () => translate("validation.dailyStartTomorrow"),
  END_AFTER_START: () => translate("validation.endAfterStart"),
  FILE_SIZE_MAX_MB: () => translate("validation.fileSizeMaxMb", { size: 5 }),
  IMAGE_TYPES: () => translate("validation.imageTypes"),
  MAX_BOOKINGS_RANGE: () =>
    translate("validation.maxBookingsRange", { min: 1, max: 10 }),
  MAX_LENGTH: (fieldName: string, count: number) =>
    translate("validation.maxLength", {
      field: translateField(fieldName),
      count,
    }),
  NUMBER_ONLY: (fieldName: string) =>
    translate("validation.numbersOnly", { field: translateField(fieldName) }),
  SELECT_VIETNAM_CITY: () => translate("validation.selectVietnamCity"),
  START_TIME_FUTURE: () => translate("validation.startTimeFuture"),
};
