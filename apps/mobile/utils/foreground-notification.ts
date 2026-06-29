import type { NotificationCategory } from "@/interfaces";
import { i18n } from "@/i18n";
import type { RemoteMessage } from "@react-native-firebase/messaging";

export type ForegroundNotification = {
  id?: string;
  notificationId?: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  deepLink?: string;
};

const FALLBACK_TITLE_KEYS: Record<NotificationCategory, string> = {
  reminder: "notifications.foreground.fallbackTitle.reminder",
  booking: "notifications.foreground.fallbackTitle.booking",
  social: "notifications.foreground.fallbackTitle.social",
  ai: "notifications.foreground.fallbackTitle.ai",
  system: "notifications.foreground.fallbackTitle.system",
};

const asNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const getNotificationCategory = (type: string): NotificationCategory => {
  if (type.includes("reminder")) return "reminder";
  if (type.includes("sitter") || type.includes("booking")) return "booking";
  if (type.includes("photo") || type.includes("social")) return "social";
  if (type.includes("ai")) return "ai";
  return "system";
};

export const normalizeForegroundNotification = (
  remoteMessage: RemoteMessage,
): ForegroundNotification | null => {
  const data = remoteMessage.data ?? {};
  const type = asNonEmptyString(data.notificationType) ?? "system";
  const category = getNotificationCategory(type);
  const title =
    asNonEmptyString(remoteMessage.notification?.title) ??
    asNonEmptyString(data.title) ??
    asNonEmptyString(data.notificationTitle);
  const message =
    asNonEmptyString(remoteMessage.notification?.body) ??
    asNonEmptyString(data.body) ??
    asNonEmptyString(data.message);

  if (!title && !message && type === "system") {
    return null;
  }

  const deepLinkValue = asNonEmptyString(data.deepLink);
  const deepLink = deepLinkValue?.startsWith("/") ? deepLinkValue : undefined;
  const notificationId = asNonEmptyString(data.notificationId);

  return {
    id: notificationId ?? asNonEmptyString(remoteMessage.messageId),
    notificationId,
    type,
    category,
    title: title ?? i18n.t(FALLBACK_TITLE_KEYS[category]),
    message: message ?? i18n.t("notifications.foreground.fallbackMessage"),
    deepLink,
  };
};

const normalizePath = (path?: string) => {
  if (!path) return undefined;

  const pathname = path.split("?")[0];
  const segments = pathname
    .split("/")
    .filter((segment) => segment && !/^\(.+\)$/.test(segment));

  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
};

export const isViewingForegroundNotificationTarget = (params: {
  notification: ForegroundNotification;
  pathname: string;
  segments: readonly string[];
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const { notification, pathname, segments, searchParams } = params;
  const currentPath = normalizePath(pathname) ?? "/";

  if (currentPath === "/notifications" || segments.includes("notifications")) {
    return true;
  }

  if (notification.category === "reminder" && segments.includes("(reminder)")) {
    return true;
  }

  const targetPath = normalizePath(notification.deepLink);
  if (!targetPath || targetPath === "/") {
    return false;
  }

  if (targetPath === "/sitter") {
    const targetBookingId = new URLSearchParams(
      notification.deepLink?.split("?")[1],
    ).get("bookingId");
    const currentBookingId = searchParams?.bookingId;

    return (
      typeof currentBookingId === "string" &&
      Boolean(targetBookingId) &&
      currentBookingId === targetBookingId
    );
  }

  return currentPath === targetPath;
};
