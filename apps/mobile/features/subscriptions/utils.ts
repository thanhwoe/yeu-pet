import { i18n } from "@/i18n";
import { SubscriptionEntitlements } from "@/interfaces";
import { formatSubscriptionDate as formatLocalizedSubscriptionDate } from "@/utils/date-time";

export const formatSubscriptionStatus = (
  status: SubscriptionEntitlements["status"],
) => {
  const fallback = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return i18n.t(`subscription.status.${status}`, {
    defaultValue: fallback,
  });
};

export const formatSubscriptionDate = (value?: string | null) => {
  if (!value) return undefined;

  return formatLocalizedSubscriptionDate(value);
};

export const getPlanPeriodCopy = (subscription: SubscriptionEntitlements) => {
  if (subscription.tier !== "premium") {
    return i18n.t("subscription.period.unlockCopy");
  }

  const expiresAt = formatSubscriptionDate(subscription.expiresAt);
  return expiresAt
    ? i18n.t("subscription.period.currentAccessThrough", { date: expiresAt })
    : i18n.t("subscription.period.activePlan");
};
