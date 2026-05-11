export const ERROR_MESSAGE = {
  FIELD_INVALID: (fieldName: string) => `Invalid ${fieldName}`,
  FIELD_REQUIRED: (fieldName: string) => `${fieldName} cannot be empty`,
  PASSWORD_CANNOT_BE_LESS_THAN_8_CHARACTERS:
    "Password cannot be less than 8 characters",
  FIELD_LENGTH: (fieldName: string, length: number) =>
    `${fieldName} must be exactly ${length} characters`,
  NUMBER_ONLY: (fieldName: string) => `${fieldName} must contain numbers only`,
};
