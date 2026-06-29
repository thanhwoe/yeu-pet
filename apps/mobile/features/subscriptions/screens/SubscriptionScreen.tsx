import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import {
  formatSubscriptionStatus,
  getPlanPeriodCopy,
} from "@/features/subscriptions/utils";
import { usePremiumPaywall } from "@/features/subscriptions/usePremiumPaywall";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  SubscriptionEntitlements,
  SubscriptionLimits,
  SubscriptionUsage,
} from "@/interfaces";
import {
  getSubscriptionQuery,
  mockDowngradeSubscriptionMutation,
  mockUpgradeSubscriptionMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CaretDownIcon,
  CheckCircleIcon,
  CrownIcon,
  HeartbeatIcon,
  ImageIcon,
  LockKeyIcon,
  PawPrintIcon,
  SparkleIcon,
  WalletIcon,
} from "phosphor-react-native";
import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

const CaretDown = withIconClassName(CaretDownIcon);
const CheckCircle = withIconClassName(CheckCircleIcon);
const Crown = withIconClassName(CrownIcon);
const Heartbeat = withIconClassName(HeartbeatIcon);
const Image = withIconClassName(ImageIcon);
const LockKey = withIconClassName(LockKeyIcon);
const PawPrint = withIconClassName(PawPrintIcon);
const Sparkle = withIconClassName(SparkleIcon);
const Wallet = withIconClassName(WalletIcon);

type UsageItem = {
  labelKey: string;
  usageKey: keyof SubscriptionUsage;
  limitKey: keyof Pick<
    SubscriptionLimits,
    | "maxPets"
    | "maxActiveReminders"
    | "maxMedicalRecords"
    | "maxBudgetTransactionsPerMonth"
    | "maxPhotos"
    | "aiMessagesPerMonth"
  >;
  periodLabelKey?: string;
};

const USAGE_ITEMS: UsageItem[] = [
  {
    labelKey: "subscription.usage.items.pets",
    usageKey: "pets",
    limitKey: "maxPets",
  },
  {
    labelKey: "subscription.usage.items.activeReminders",
    usageKey: "activeReminders",
    limitKey: "maxActiveReminders",
  },
  {
    labelKey: "subscription.usage.items.medicalRecords",
    usageKey: "medicalRecords",
    limitKey: "maxMedicalRecords",
  },
  {
    labelKey: "subscription.usage.items.budgetTransactions",
    usageKey: "budgetTransactionsThisMonth",
    limitKey: "maxBudgetTransactionsPerMonth",
    periodLabelKey: "subscription.usage.period.thisMonth",
  },
  {
    labelKey: "subscription.usage.items.photos",
    usageKey: "photos",
    limitKey: "maxPhotos",
  },
  {
    labelKey: "subscription.usage.items.aiMessages",
    usageKey: "aiMessagesThisMonth",
    limitKey: "aiMessagesPerMonth",
    periodLabelKey: "subscription.usage.period.thisMonth",
  },
];

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View className="gap-2 px-2">
      <Text variant="title3" className="font-bold">
        {title}
      </Text>
      {description ? (
        <Text variant="footnote" className="text-text-muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function PlanCard({
  isManaging,
  isUpgrading,
  onManage,
  subscription,
  onUpgrade,
}: {
  isManaging: boolean;
  isUpgrading: boolean;
  onManage: () => void;
  subscription: SubscriptionEntitlements;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const isPremium = subscription.tier === "premium";
  const statusLabel = isPremium
    ? formatSubscriptionStatus(subscription.status)
    : t("subscription.plan.free");

  return (
    <View
      className={
        isPremium
          ? "gap-18 rounded-24 border border-status-success-border bg-background-surface px-18 py-20 shadow-sm"
          : "gap-18 rounded-24 border border-line-subtle bg-background-surface px-18 py-20 shadow-sm"
      }
    >
      <View className="flex-row items-start gap-14">
        <View
          className={
            isPremium
              ? "h-48 w-48 items-center justify-center rounded-16 bg-status-success-surface"
              : "h-48 w-48 items-center justify-center rounded-16 bg-background-surface-muted"
          }
        >
          <Crown
            size={26}
            weight="duotone"
            className={
              isPremium ? "text-status-success-icon" : "text-icon-secondary"
            }
          />
        </View>
        <View className="flex-1 gap-6">
          <View className="flex-row flex-wrap items-center gap-8">
            <Text variant="title2" className="font-bold">
              {isPremium
                ? t("subscription.plan.premiumPlan")
                : t("subscription.plan.freePlan")}
            </Text>
            <View
              className={
                isPremium
                  ? "rounded-full px-16 border border-status-success-border bg-status-success-surface px-9 py-4"
                  : "rounded-full px-16 border border-line-subtle bg-background-surface-muted px-9 py-4"
              }
            >
              <Text
                variant="caption1"
                className={
                  isPremium
                    ? "font-semibold text-status-success-text"
                    : "font-semibold text-text-secondary"
                }
              >
                {statusLabel}
              </Text>
            </View>
          </View>
          <Text variant="body2" className="text-text-muted">
            {getPlanPeriodCopy(subscription)}
          </Text>
        </View>
      </View>

      {isPremium ? (
        <Button
          accessibilityLabel={t("subscription.accessibility.managePremium")}
          variant="outline"
          loading={isManaging}
          onPress={onManage}
        >
          {t("subscription.actions.manage")}
        </Button>
      ) : (
        <View className="gap-14">
          <Text variant="body2" className="text-text-secondary">
            {t("subscription.plan.upgradeCopy")}
          </Text>
          <Button
            accessibilityLabel={t("subscription.accessibility.upgradePremium")}
            loading={isUpgrading}
            onPress={onUpgrade}
          >
            {t("subscription.actions.upgrade")}
          </Button>
        </View>
      )}
    </View>
  );
}

function UsageRow({
  label,
  usage,
  limit,
  periodLabel,
}: {
  label: string;
  usage?: number;
  limit: number;
  periodLabel?: string;
}) {
  const { t } = useTranslation();
  const usageAvailable = typeof usage === "number" && Number.isFinite(usage);
  const unlimited = limit < 0;
  const overLimit = usageAvailable && !unlimited && usage > limit;
  const progress =
    !usageAvailable || unlimited || limit <= 0
      ? 0
      : Math.min(100, (usage / limit) * 100);

  return (
    <View className="gap-8 border-b border-line-subtle px-16 py-14 last:border-b-0">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1 gap-1">
          <Text variant="body2" className="font-semibold">
            {label}
          </Text>
          {periodLabel ? (
            <Text variant="caption1" className="text-text-muted">
              {periodLabel}
            </Text>
          ) : null}
        </View>
        {unlimited ? (
          <View className="rounded-full px-8 border border-status-success-border bg-status-success-surface px-9 py-4">
            <Text
              variant="caption1"
              className="font-semibold text-status-success-text"
            >
              {t("subscription.values.unlimited")}
            </Text>
          </View>
        ) : (
          <Text
            variant="footnote"
            className={
              overLimit ? "font-semibold text-text-warning" : "text-text-muted"
            }
          >
            {usageAvailable
              ? t("subscription.values.usageOfLimit", { limit, usage })
              : t("subscription.values.notAvailable")}
          </Text>
        )}
      </View>

      {!unlimited && usageAvailable ? (
        <View className="h-8 w-full">
          <ProgressBar progress={progress} shimmer={false} />
        </View>
      ) : null}

      {overLimit ? (
        <Text variant="caption1" className="text-text-warning">
          {t("subscription.values.overLimit")}
        </Text>
      ) : null}
    </View>
  );
}

function FeatureRow({
  label,
  value,
  included,
}: {
  label: string;
  value?: number;
  included?: boolean;
}) {
  const { t } = useTranslation();
  const valueLabel =
    included === undefined
      ? value === -1
        ? t("subscription.values.unlimited")
        : (value ?? t("subscription.values.notAvailable")).toString()
      : included
        ? t("subscription.values.included")
        : t("subscription.values.premiumOnly");

  return (
    <View className="min-h-48 flex-row items-center gap-10 border-b border-line-subtle px-16 py-10 last:border-b-0">
      {included === undefined || included ? (
        <CheckCircle
          size={19}
          weight="fill"
          className="text-status-success-icon"
        />
      ) : (
        <LockKey size={19} className="text-icon-muted" />
      )}
      <Text variant="body2" className="flex-1">
        {label}
      </Text>
      <Text
        variant="footnote"
        className={
          included === false
            ? "text-text-muted"
            : "font-semibold text-text-secondary"
        }
      >
        {valueLabel}
      </Text>
    </View>
  );
}

function FeatureGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-20 border-hairline border-line-subtle bg-background-surface">
      <View className="flex-row items-center gap-10 bg-background-surface-muted px-16 py-12">
        {icon}
        <Text variant="heading" className="font-bold">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function BenefitsCard({ premium }: { premium: boolean }) {
  const { t } = useTranslation();
  const benefits = useMemo(() => {
    const items = t("subscription.benefits.items", {
      returnObjects: true,
    });

    return Array.isArray(items) ? items.map(String) : [];
  }, [t]);

  return (
    <View className="gap-14 rounded-22 border-hairline border-line-subtle bg-background-surface px-16 py-16">
      <Text variant="body2" className="text-text-muted">
        {premium
          ? t("subscription.benefits.activeIntro")
          : t("subscription.benefits.upgradeIntro")}
      </Text>
      <View className="gap-11">
        {benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-start gap-10">
            <CheckCircle
              size={19}
              weight="fill"
              className={
                premium
                  ? "mt-1 text-status-success-icon"
                  : "mt-1 text-icon-primary-highlight"
              }
            />
            <Text variant="body2" className="flex-1 text-text-secondary">
              {benefit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DeveloperTools({
  subscription,
}: {
  subscription: SubscriptionEntitlements;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const syncSubscription = (nextSubscription: SubscriptionEntitlements) => {
    queryClient.setQueryData(SUBSCRIPTION_KEY.detail(), nextSubscription);
    queryClient.setQueryData(SUBSCRIPTION_KEY.entitlements(), nextSubscription);
  };

  const upgradeMutation = useMutation({
    mutationFn: mockUpgradeSubscriptionMutation,
    onSuccess: (nextSubscription) => {
      syncSubscription(nextSubscription);
      Toast.success({
        title: t("subscription.developer.premiumEnabledTitle"),
        text: t("subscription.developer.premiumEnabledText"),
      });
    },
    onError: (error: Error) =>
      Toast.error({
        title: t("subscription.developer.updateErrorTitle"),
        text: error.message || t("subscription.developer.updateErrorPremiumText"),
      }),
  });
  const downgradeMutation = useMutation({
    mutationFn: mockDowngradeSubscriptionMutation,
    onSuccess: (nextSubscription) => {
      syncSubscription(nextSubscription);
      Toast.success({
        title: t("subscription.developer.freeEnabledTitle"),
        text: t("subscription.developer.freeEnabledText"),
      });
    },
    onError: (error: Error) =>
      Toast.error({
        title: t("subscription.developer.updateErrorTitle"),
        text: error.message || t("subscription.developer.updateErrorFreeText"),
      }),
  });

  return (
    <View className="overflow-hidden rounded-20 border-hairline border-line-subtle bg-background-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("subscription.accessibility.toggleDeveloperTools")}
        accessibilityState={{ expanded }}
        className="min-h-48 flex-row items-center gap-10 px-16 py-12"
        onPress={() => setExpanded((current) => !current)}
      >
        <Text variant="body2" className="flex-1 font-semibold">
          {t("subscription.developer.title")}
        </Text>
        <CaretDown
          size={20}
          className="text-icon-secondary"
          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
        />
      </Pressable>

      {expanded ? (
        <View className="gap-12 border-t border-line-subtle px-16 py-14">
          <Text variant="footnote" className="text-text-muted">
            {t("subscription.developer.currentTier", {
              tier: subscription.tier,
            })}
          </Text>
          <View className="flex-row flex-wrap gap-10">
            <Button
              size="sm"
              variant="outline"
              loading={upgradeMutation.isPending}
              disabled={subscription.tier === "premium"}
              onPress={() => upgradeMutation.mutate()}
            >
              {t("subscription.actions.mockUpgrade")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={downgradeMutation.isPending}
              disabled={subscription.tier === "free"}
              onPress={() => downgradeMutation.mutate()}
            >
              {t("subscription.actions.mockDowngrade")}
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SubscriptionLoading() {
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollEnabled
      accessibilityLabel={t("subscription.accessibility.loadingDetails")}
    >
      <View className="gap-24 px-20 pb-40 pt-18">
        <View className="gap-14 rounded-24 border-hairline border-line-subtle bg-background-surface px-18 py-20">
          <View className="h-24 w-140 rounded-full bg-background-surface-muted" />
          <View className="h-16 w-full rounded-full bg-background-surface-muted" />
          <View className="h-48 w-full rounded-16 bg-background-surface-muted" />
        </View>
        <View className="gap-10">
          <View className="h-22 w-160 rounded-full bg-background-surface-muted" />
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              className="h-64 rounded-18 bg-background-surface-muted"
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

export function SubscriptionScreen() {
  const { t } = useTranslation();
  const { isManaging, isPresenting, presentCustomerCenter, presentPaywall } =
    usePremiumPaywall();
  const {
    data: subscription,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: SUBSCRIPTION_KEY.detail(),
    queryFn: getSubscriptionQuery,
    staleTime: 60_000,
  });

  if (isLoading && !subscription) {
    return <SubscriptionLoading />;
  }

  if (isError || !subscription) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title={t("subscription.loading.errorTitle")}
          description={t("subscription.loading.errorDescription")}
          actionLabel={t("common.tryAgain")}
          onAction={() => void refetch()}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  const isPremium = subscription.tier === "premium";
  const handleUpgrade = () => void presentPaywall();
  const handleManage = () => void presentCustomerCenter();

  return (
    <ScreenContainer scrollEnabled>
      <View className="gap-26 px-20 pb-40 pt-18">
        <PlanCard
          subscription={subscription}
          isManaging={isManaging}
          isUpgrading={isPresenting}
          onManage={handleManage}
          onUpgrade={handleUpgrade}
        />

        <View className="gap-10">
          <SectionHeading
            title={t("subscription.sections.usageTitle")}
            description={t("subscription.sections.usageDescription")}
          />
          <View className="overflow-hidden rounded-22 border-hairline border-line-subtle bg-background-surface">
            {USAGE_ITEMS.map((item) => (
              <UsageRow
                key={item.usageKey}
                label={t(item.labelKey)}
                usage={subscription.usage?.[item.usageKey]}
                limit={subscription.limits[item.limitKey]}
                periodLabel={
                  item.periodLabelKey ? t(item.periodLabelKey) : undefined
                }
              />
            ))}
          </View>
        </View>

        <View className="gap-12">
          <SectionHeading
            title={t("subscription.sections.featureLimitsTitle")}
            description={t("subscription.sections.featureLimitsDescription")}
          />
          <FeatureGroup
            title={t("subscription.featureGroups.petCare")}
            icon={
              <PawPrint
                size={21}
                weight="duotone"
                className="text-icon-primary-highlight"
              />
            }
          >
            <FeatureRow
              label={t("subscription.features.pets")}
              value={subscription.limits.maxPets}
            />
            <FeatureRow
              label={t("subscription.features.activeReminders")}
              value={subscription.limits.maxActiveReminders}
            />
            <FeatureRow
              label={t("subscription.features.recurringReminders")}
              included={subscription.limits.recurringReminders}
            />
          </FeatureGroup>
          <FeatureGroup
            title={t("subscription.featureGroups.health")}
            icon={
              <Heartbeat
                size={21}
                weight="duotone"
                className="text-status-success-icon"
              />
            }
          >
            <FeatureRow
              label={t("subscription.features.medicalRecords")}
              value={subscription.limits.maxMedicalRecords}
            />
            <FeatureRow
              label={t("subscription.features.imagesPerRecord")}
              value={subscription.limits.maxImagesPerMedicalRecord}
            />
            <FeatureRow
              label={t("subscription.features.exportMedicalSummary")}
              included={subscription.limits.exportMedicalSummary}
            />
          </FeatureGroup>
          <FeatureGroup
            title={t("subscription.featureGroups.budget")}
            icon={
              <Wallet
                size={21}
                weight="duotone"
                className="text-icon-warning"
              />
            }
          >
            <FeatureRow
              label={t("subscription.features.budgetTransactions")}
              value={subscription.limits.maxBudgetTransactionsPerMonth}
            />
            <FeatureRow
              label={t("subscription.features.yearlyStatistics")}
              included={subscription.limits.yearlyBudgetStats}
            />
          </FeatureGroup>
          <FeatureGroup
            title={t("subscription.featureGroups.photos")}
            icon={
              <Image
                size={21}
                weight="duotone"
                className="text-icon-secondary"
              />
            }
          >
            <FeatureRow
              label={t("subscription.features.photos")}
              value={subscription.limits.maxPhotos}
            />
          </FeatureGroup>
          <FeatureGroup
            title={t("subscription.featureGroups.ai")}
            icon={
              <Sparkle size={21} weight="duotone" className="text-icon-info" />
            }
          >
            <FeatureRow
              label={t("subscription.features.aiMessagesPerMonth")}
              value={subscription.limits.aiMessagesPerMonth}
            />
            <FeatureRow
              label={t("subscription.features.aiPetContext")}
              included={subscription.limits.aiWithPetContext}
            />
            <FeatureRow
              label={t("subscription.features.aiMedicalHistory")}
              included={subscription.limits.aiWithMedicalHistory}
            />
          </FeatureGroup>
        </View>

        <View className="gap-10">
          <SectionHeading
            title={
              isPremium
                ? t("subscription.benefits.activeTitle")
                : t("subscription.benefits.upgradeTitle")
            }
            description={
              isPremium
                ? t("subscription.benefits.activeDescription")
                : t("subscription.benefits.upgradeDescription")
            }
          />
          <BenefitsCard premium={isPremium} />
          <Text variant="caption1" className="px-2 text-text-muted">
            {t("subscription.benefits.disclaimer")}
          </Text>
          {!isPremium ? (
            <Button
              accessibilityLabel={t("subscription.accessibility.upgradePremium")}
              loading={isPresenting}
              onPress={handleUpgrade}
            >
              {t("subscription.actions.upgrade")}
            </Button>
          ) : null}
        </View>

        {__DEV__ ? <DeveloperTools subscription={subscription} /> : null}
      </View>
    </ScreenContainer>
  );
}
