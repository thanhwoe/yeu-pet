export const API_ROUTES = {
  SIGN_IN: "/auth/login",
  SIGN_UP: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",

  COMPLETE_ONBOARDING: "/users/complete-onboarding",
  RESEND_OTP: "/users/resend-otp",
  VERIFY_OTP: "/users/verify",
  ME: "/users/me",
  DEVICE: "/devices",

  REQUEST_RESET_PASSWORD: "/users/password/request",
  RESET_PASSWORD: "/users/password/reset",

  PETS: "/pets",
  MUTATE_PET: (id: string) => `/pets/${id}`,

  REMINDERS: "/reminders",
  MUTATE_REMINDER: (id: string) => `/reminders/${id}`,

  SUGGEST_CLINIC: (city: string) => `/clinic/${city}/suggest`,
  LIST_CLINIC: "/clinic",

  LIST_SPA: "/spa",

  UPLOAD_FILE: "/upload-file",

  BUDGETS: "/budgets",

  BUDGET_CATEGORIES: "/budgets/categories",
  MUTATE_BUDGET_CATEGORY: (id: string) => `/budgets/categories/${id}`,

  BUDGET_TRANSACTIONS: "/budgets/transactions",
  MUTATE_BUDGET_TRANSACTION: (id: string) => `/budgets/transactions/${id}`,

  BUDGET_STATISTIC_MONTHLY: "/budgets/statistics/monthly",
  BUDGET_STATISTIC_YEARLY: "/budgets/statistics/yearly",

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

  LIST_SHIPPING_ADDRESS: "/shipping-address",
  CREATE_SHIPPING_ADDRESS: "/shipping-address/create",
  UPDATE_SHIPPING_ADDRESS: (id: string) => `/shipping-address/${id}/update`,
  DELETE_SHIPPING_ADDRESS: (id: string) => `/shipping-address/${id}/delete`,

  PAYMENT_VNPAY: "/payment/vnpay",
};
