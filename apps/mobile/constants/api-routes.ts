export const API_ROUTES = {
  SIGN_IN: "/auth/login",
  SIGN_UP: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",

  COMPLETE_ONBOARDING: "/users/complete-onboarding",
  RESEND_OTP: "/users/resend-otp",
  VERIFY_OTP: "/users/verify",
  ME: "/me",
  ME_AVATAR: "/me/avatar",
  ME_EMAIL_CHANGE_REQUEST: "/me/email-change/request",
  ME_EMAIL_CHANGE_VERIFY: "/me/email-change/verify",
  ME_EMAIL_CHANGE_RESEND: "/me/email-change/resend",
  ME_EMAIL_CHANGE_CANCEL: "/me/email-change/cancel",
  DEACTIVATE_ME: "/me",
  DEVICE: "/devices",

  REQUEST_RESET_PASSWORD: "/users/password/request",
  RESET_PASSWORD: "/users/password/reset",

  PETS: "/pets",
  MUTATE_PET: (id: string) => `/pets/${id}`,

  REMINDERS: "/reminders",
  UPCOMING_REMINDERS: "/reminders/upcoming",
  MUTATE_REMINDER: (id: string) => `/reminders/${id}`,
  COMPLETE_REMINDER: (id: string) => `/reminders/${id}/complete`,
  SKIP_REMINDER: (id: string) => `/reminders/${id}/skip`,
  CANCEL_REMINDER: (id: string) => `/reminders/${id}/cancel`,

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

  UPLOAD_PHOTO: "/photos",
  PHOTOS: "/photos/social",
  USER_PHOTOS: "/photos/me",
  LIKE_PHOTO: (id: string) => `/photos/${id}/like`,
  DELETE_PHOTO: (id: string) => `/photos/${id}`,
  PHOTO_STATS: (id: string) => `/photos/${id}`,
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

  SUBSCRIPTIONS_ME: "/subscriptions/me",
  SUBSCRIPTION_ENTITLEMENTS: "/subscriptions/entitlements",
  SUBSCRIPTION_MOCK_UPGRADE: "/subscriptions/mock-upgrade",
  SUBSCRIPTION_MOCK_DOWNGRADE: "/subscriptions/mock-downgrade",

  SITTERS: "/sitters",
  CREATE_MY_SITTER_PROFILE: "/sitters/me",
  MY_SITTER_PROFILE: "/sitters/me",
  SITTER_DETAIL: (id: string) => `/sitters/${id}`,
  SITTER_BOOKINGS: "/sitter-bookings",
  MY_SITTER_BOOKINGS: "/sitter-bookings/me",
  SITTER_BOOKING_DETAIL: (id: string) => `/sitter-bookings/${id}`,
  ACCEPT_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/accept`,
  REJECT_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/reject`,
  COMPLETE_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/complete`,
  CANCEL_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/cancel`,
  REVIEW_SITTER_BOOKING: (id: string) => `/sitter-bookings/${id}/review`,
  SITTER_BOOKING_MESSAGES: (id: string) => `/sitter-bookings/${id}/messages`,
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
  MEDICAL_RECORDS_FOR_PET: (petId: string) =>
    `/pets/${petId}/medical-records`,
  MEDICAL_RECORD_DETAIL: (id: string) => `/medical-records/${id}`,
  MEDICAL_RECORD_ATTACHMENTS: (id: string) =>
    `/medical-records/${id}/attachments`,
  MEDICAL_RECORD_ATTACHMENT: (id: string, attachmentId: string) =>
    `/medical-records/${id}/attachments/${attachmentId}`,

  AI_CONVERSATIONS: "/ai/conversations",
  AI_CONVERSATION_DETAIL: (id: string) => `/ai/conversations/${id}`,
  AI_CONVERSATION_MESSAGES: (id: string) => `/ai/conversations/${id}/messages`,
  AI_CONVERSATION_MESSAGES_STREAM: (id: string) =>
    `/ai/conversations/${id}/messages/stream`,

  REPORTS: "/reports",
  MY_REPORTS: "/reports/me",
  MY_BLOCKS: "/blocks/me",
  BLOCK_USER: (id: string) => `/blocks/${id}`,
};
