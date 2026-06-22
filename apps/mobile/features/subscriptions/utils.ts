import { SubscriptionEntitlements } from "@/interfaces";
import dayjs from "dayjs";

export const formatSubscriptionStatus = (
  status: SubscriptionEntitlements["status"],
) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const formatSubscriptionDate = (value?: string | null) => {
  if (!value) return undefined;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMM D, YYYY") : undefined;
};

export const getPlanPeriodCopy = (subscription: SubscriptionEntitlements) => {
  if (subscription.tier !== "premium") {
    return "Track your usage and unlock more pet-care features.";
  }

  const expiresAt = formatSubscriptionDate(subscription.expiresAt);
  return expiresAt ? `Current access through ${expiresAt}` : "Active plan";
};
