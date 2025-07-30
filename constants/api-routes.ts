export const API_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  OTP_CONFIRM: "/otp-confirm",
  UPDATE_PASSWORD: "/update-password",

  COMPLETE_ONBOARDING: "/complete-onboarding",

  CREATE_PET: "/create-pet",
  LIST_PET: "/pet",
  UPDATE_PET: (id: string) => `/pet/${id}/update`,
  DELETE_PET: (id: string) => `/pet/${id}/delete`,

  SUGGEST_CLINIC: (city: string) => `/clinic/${city}/suggest`,
  LIST_CLINIC: "/clinic",

  CREATE_REMINDER: "/reminder/create",
  REMINDER: "/reminder",
  UPDATE_REMINDER: (id: string) => `/reminder/${id}/update`,
  DELETE_REMINDER: (id: string) => `/reminder/${id}/delete`,

  UPLOAD_FILE: "/upload-file",
};
