import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { SubscriptionEntitlements } from "@/interfaces";
import { getEntitlementsQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

type LimitKey = keyof Pick<
  SubscriptionEntitlements["limits"],
  | "maxPets"
  | "maxActiveReminders"
  | "maxMedicalRecords"
  | "maxImagesPerMedicalRecord"
  | "maxBudgetTransactionsPerMonth"
  | "maxPhotos"
  | "aiMessagesPerMonth"
>;

type UsageKey = keyof SubscriptionEntitlements["usage"];

const USAGE_BY_LIMIT: Record<LimitKey, UsageKey> = {
  aiMessagesPerMonth: "aiMessagesThisMonth",
  maxActiveReminders: "activeReminders",
  maxBudgetTransactionsPerMonth: "budgetTransactionsThisMonth",
  maxImagesPerMedicalRecord: "medicalRecords",
  maxMedicalRecords: "medicalRecords",
  maxPets: "pets",
  maxPhotos: "photos",
};

export const useEntitlements = () => {
  const query = useQuery({
    queryKey: SUBSCRIPTION_KEY.entitlements(),
    queryFn: getEntitlementsQuery,
    staleTime: 60_000,
  });

  const isPremium = query.data?.tier === "premium";

  const getLimitState = (limitKey: LimitKey, overrideUsage?: number) => {
    const entitlements = query.data;
    if (!entitlements) {
      return {
        allowed: true,
        limit: undefined,
        usage: overrideUsage,
        remaining: undefined,
      };
    }

    const limit = entitlements.limits[limitKey];
    const unlimited = limit < 0;
    const usage =
      overrideUsage ?? entitlements.usage[USAGE_BY_LIMIT[limitKey]] ?? 0;
    const remaining = unlimited ? undefined : Math.max(0, limit - usage);

    return {
      allowed: unlimited || usage < limit,
      limit,
      usage,
      remaining,
    };
  };

  return {
    ...query,
    entitlements: query.data,
    getLimitState,
    isPremium,
    upgrade: () => router.push("/subscription"),
    isUpgrading: false,
  };
};
