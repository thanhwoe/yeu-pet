import { i18n } from "@/i18n";

type ApiErrorLike = {
  errorCode?: string;
  message?: string;
  messageKey?: string;
  params?: Record<string, unknown>;
  statusCode?: number;
};

type ErrorToastFallback = {
  textKey?: string;
  titleKey?: string;
};

const ERROR_CODE_TO_KEY: Record<string, string> = {
  BAD_REQUEST: "errors.common.badRequest",
  CONFLICT: "errors.common.conflict",
  EMAIL_ALREADY_EXISTS: "errors.auth.emailAlreadyExists",
  FEATURE_LIMIT_REACHED: "errors.subscription.featureLimitReached",
  FORBIDDEN: "errors.common.forbidden",
  INTERNAL_SERVER_ERROR: "errors.common.internalServerError",
  INVALID_CREDENTIALS: "errors.auth.invalidCredentials",
  NETWORK_ERROR: "apiError.networkText",
  NOT_FOUND: "errors.common.notFound",
  OTP_EXPIRED: "errors.auth.otpExpired",
  OTP_INVALID: "errors.auth.otpInvalid",
  PREMIUM_REQUIRED: "errors.subscription.premiumRequired",
  REQUEST_FAILED: "apiError.genericText",
  TOO_MANY_REQUESTS: "errors.common.tooManyRequests",
  UNAUTHORIZED: "errors.common.unauthorized",
  VALIDATION_FAILED: "errors.common.validationFailed",
};

const STATUS_TO_KEY: Record<number, string> = {
  400: "errors.common.badRequest",
  401: "errors.common.unauthorized",
  403: "errors.common.forbidden",
  404: "errors.common.notFound",
  409: "errors.common.conflict",
  422: "errors.common.validationFailed",
  429: "errors.common.tooManyRequests",
  500: "errors.common.internalServerError",
};

const toApiError = (error: unknown): ApiErrorLike => {
  if (error && typeof error === "object") {
    return error as ApiErrorLike;
  }

  return {};
};

export const formatApiErrorMessage = (
  error: unknown,
  fallbackKey = "apiError.genericText",
) => {
  const apiError = toApiError(error);
  const candidateKeys = [
    apiError.messageKey,
    apiError.errorCode ? ERROR_CODE_TO_KEY[apiError.errorCode] : undefined,
    apiError.statusCode ? STATUS_TO_KEY[apiError.statusCode] : undefined,
    fallbackKey,
  ].filter(Boolean) as string[];

  const translationKey = candidateKeys.find((key) => i18n.exists(key));

  return i18n.t(translationKey ?? fallbackKey, apiError.params);
};

export const getApiErrorToast = (
  error: unknown,
  fallback: ErrorToastFallback = {},
) => {
  const titleKey = fallback.titleKey ?? "apiError.genericTitle";
  const textKey = fallback.textKey ?? "apiError.genericText";

  return {
    title: i18n.t(titleKey),
    text: formatApiErrorMessage(error, textKey),
  };
};
