export const API_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  OTP_CONFIRM: "/otp-confirm",
  UPDATE_PASSWORD: "/update-password",
  REFRESH_TOKEN: "/refresh-token",
  LOGOUT: "/logout",

  COMPLETE_ONBOARDING: "/complete-onboarding",

  CREATE_PET: "/create-pet",
  LIST_PET: "/pet",
  UPDATE_PET: (id: string) => `/pet/${id}/update`,
  DELETE_PET: (id: string) => `/pet/${id}/delete`,

  SUGGEST_CLINIC: (city: string) => `/clinic/${city}/suggest`,
  LIST_CLINIC: "/clinic",

  LIST_SPA: "/spa",

  CREATE_REMINDER: "/reminder/create",
  REMINDER: "/reminder",
  UPDATE_REMINDER: (id: string) => `/reminder/${id}/update`,
  DELETE_REMINDER: (id: string) => `/reminder/${id}/delete`,

  UPLOAD_FILE: "/upload-file",

  CREATE_BUDGET_TRANSACTION: "/budget/transaction/create",
  UPDATE_BUDGET_TRANSACTION: (id: string) => `/budget/transaction/${id}/update`,
  DELETE_BUDGET_TRANSACTION: (id: string) => `/budget/transaction/${id}/delete`,
  LIST_BUDGET_TRANSACTION: "/budget/transaction",

  BUDGET: "/budget",
  UPDATE_BUDGET: "/budget/update",

  DAILY_SPENT_CHART: "/budget/daily-spent-chart",
  MONTHLY_SPENT_CHART: "/budget/monthly-spent-chart",

  UPLOAD_PHOTO: "/photos/upload",
  PHOTOS: "/photos",
  USER_PHOTOS: "/photos/user",
  TOGGLE_LIKE_PHOTO: (id: string) => `/photos/${id}/like`,
  DELETE_PHOTO: (id: string) => `/photos/${id}/delete`,
  PHOTO_STATS: (id: string) => `/photos/${id}/stats`,

  LIST_PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,

  CART: "/cart",
  ADD_TO_CART: "/cart/add",
  UPDATE_CART: "/cart/update",
  DELETE_CART_ITEM: (id: string) => `/cart/delete/${id}`,
  CART_COUNT: "/cart/count",

  ORDER_SUMMARY: "/order/summary",
};
