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
  PHOTO_COMMENTS: (photoId: string) => `/photos/${photoId}/comments`,
  PHOTO_COMMENT_REPLIES: (photoId: string, commentId: string) =>
    `/photos/${photoId}/comments/${commentId}/replies`,
  DELETE_PHOTO_COMMENT: (photoId: string, commentId: string) =>
    `/photos/${photoId}/comments/${commentId}`,

  NOTIFICATIONS: "/notifications",
  NOTIFICATION_BADGE: "/notifications/badge",
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: "/notifications/read-all",
  DELETE_NOTIFICATION: (id: string) => `/notifications/${id}`,

  SETTINGS: "/settings",

  SITTERS: "/sitters",
  REGISTER_SITTER: "/sitters/register",
  MY_SITTER_PROFILE: "/sitters/me",
  SITTER_DETAIL: (id: string) => `/sitters/${id}`,
  SITTER_BOOKINGS: "/sitter-bookings",
  SITTER_BOOKINGS_FOR_SITTER: "/sitter-bookings/sitter",
  SITTER_BOOKING_DETAIL: (id: string) => `/sitter-bookings/${id}`,
  CONFIRM_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/confirm`,
  REJECT_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/reject`,
  COMPLETE_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/complete`,
  CANCEL_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/cancel`,
  SITTER_REVIEWS: "/sitter-reviews",
  SITTER_REVIEWS_BY_SITTER: (sitterId: string) =>
    `/sitter-reviews/${sitterId}`,

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

  MEDICAL_RECORDS: "/medical-records",
  MEDICAL_RECORD_DETAIL: (id: string) => `/medical-records/${id}`,
  MEDICAL_RECORDS_BY_PET: (petId: string) => `/pets/${petId}/medical-records`,
};
