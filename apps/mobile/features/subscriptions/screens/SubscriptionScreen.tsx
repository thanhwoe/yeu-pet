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
import { ReactNode, useState } from "react";
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
  label: string;
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
  periodLabel?: string;
};

const USAGE_ITEMS: UsageItem[] = [
  { label: "Pets", usageKey: "pets", limitKey: "maxPets" },
  {
    label: "Active reminders",
    usageKey: "activeReminders",
    limitKey: "maxActiveReminders",
  },
  {
    label: "Medical records",
    usageKey: "medicalRecords",
    limitKey: "maxMedicalRecords",
  },
  {
    label: "Budget transactions",
    usageKey: "budgetTransactionsThisMonth",
    limitKey: "maxBudgetTransactionsPerMonth",
    periodLabel: "this month",
  },
  { label: "Photos", usageKey: "photos", limitKey: "maxPhotos" },
  {
    label: "AI messages",
    usageKey: "aiMessagesThisMonth",
    limitKey: "aiMessagesPerMonth",
    periodLabel: "this month",
  },
];

const PREMIUM_BENEFITS = [
  "Unlimited pets, reminders, records, and budget entries",
  "Recurring care reminders",
  "More images for each health record",
  "Yearly budget insights and medical summary export",
  "More photo memories",
  "300 AI messages with pet and medical context",
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
  const isPremium = subscription.tier === "premium";
  const statusLabel = isPremium
    ? formatSubscriptionStatus(subscription.status)
    : "Free";

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
              {isPremium ? "Premium plan" : "Free plan"}
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
          accessibilityLabel="Manage Premium subscription"
          variant="outline"
          loading={isManaging}
          onPress={onManage}
        >
          Manage subscription
        </Button>
      ) : (
        <View className="gap-14">
          <Text variant="body2" className="text-text-secondary">
            Upgrade to support more pets, reminders, photos, health records, and
            AI care conversations.
          </Text>
          <Button
            accessibilityLabel="Upgrade to Premium"
            loading={isUpgrading}
            onPress={onUpgrade}
          >
            Upgrade to Premium
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
              Unlimited
            </Text>
          </View>
        ) : (
          <Text
            variant="footnote"
            className={
              overLimit ? "font-semibold text-text-warning" : "text-text-muted"
            }
          >
            {usageAvailable ? `${usage} of ${limit}` : "Not available"}
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
          You are over this plan&apos;s limit. Existing items remain available.
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
  const valueLabel =
    included === undefined
      ? value === -1
        ? "Unlimited"
        : String(value ?? "Not available")
      : included
        ? "Included"
        : "Premium only";

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
  return (
    <View className="gap-14 rounded-22 border-hairline border-line-subtle bg-background-surface px-16 py-16">
      <Text variant="body2" className="text-text-muted">
        {premium
          ? "Everything below is active on your plan."
          : "Premium keeps everyday care flexible as your pet family grows."}
      </Text>
      <View className="gap-11">
        {PREMIUM_BENEFITS.map((benefit) => (
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
      Toast.success({ text: "Mock Premium plan enabled." });
    },
    onError: (error: Error) => Toast.error({ text: error.message }),
  });
  const downgradeMutation = useMutation({
    mutationFn: mockDowngradeSubscriptionMutation,
    onSuccess: (nextSubscription) => {
      syncSubscription(nextSubscription);
      Toast.success({ text: "Mock Free plan enabled." });
    },
    onError: (error: Error) => Toast.error({ text: error.message }),
  });

  return (
    <View className="overflow-hidden rounded-20 border-hairline border-line-subtle bg-background-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Toggle subscription developer tools"
        accessibilityState={{ expanded }}
        className="min-h-48 flex-row items-center gap-10 px-16 py-12"
        onPress={() => setExpanded((current) => !current)}
      >
        <Text variant="body2" className="flex-1 font-semibold">
          Developer tools
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
            Current mock tier: {subscription.tier}. These controls are
            unavailable in production.
          </Text>
          <View className="flex-row flex-wrap gap-10">
            <Button
              size="sm"
              variant="outline"
              loading={upgradeMutation.isPending}
              disabled={subscription.tier === "premium"}
              onPress={() => upgradeMutation.mutate()}
            >
              Mock Upgrade
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={downgradeMutation.isPending}
              disabled={subscription.tier === "free"}
              onPress={() => downgradeMutation.mutate()}
            >
              Mock Downgrade
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SubscriptionLoading() {
  return (
    <ScreenContainer
      scrollEnabled
      accessibilityLabel="Loading subscription details"
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
          title="Could not load subscription details"
          description="Check your connection and try again."
          actionLabel="Try again"
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
            title="Usage overview"
            description="Live counts from your current YeuPet account."
          />
          <View className="overflow-hidden rounded-22 border-hairline border-line-subtle bg-background-surface">
            {USAGE_ITEMS.map((item) => (
              <UsageRow
                key={item.usageKey}
                label={item.label}
                usage={subscription.usage?.[item.usageKey]}
                limit={subscription.limits[item.limitKey]}
                periodLabel={item.periodLabel}
              />
            ))}
          </View>
        </View>

        <View className="gap-12">
          <SectionHeading
            title="Feature limits"
            description="What your current plan includes across pet care."
          />
          <FeatureGroup
            title="Pet care"
            icon={
              <PawPrint
                size={21}
                weight="duotone"
                className="text-icon-primary-highlight"
              />
            }
          >
            <FeatureRow label="Pets" value={subscription.limits.maxPets} />
            <FeatureRow
              label="Active reminders"
              value={subscription.limits.maxActiveReminders}
            />
            <FeatureRow
              label="Recurring reminders"
              included={subscription.limits.recurringReminders}
            />
          </FeatureGroup>
          <FeatureGroup
            title="Health records"
            icon={
              <Heartbeat
                size={21}
                weight="duotone"
                className="text-status-success-icon"
              />
            }
          >
            <FeatureRow
              label="Medical records"
              value={subscription.limits.maxMedicalRecords}
            />
            <FeatureRow
              label="Images per record"
              value={subscription.limits.maxImagesPerMedicalRecord}
            />
            <FeatureRow
              label="Export medical summary"
              included={subscription.limits.exportMedicalSummary}
            />
          </FeatureGroup>
          <FeatureGroup
            title="Budget"
            icon={
              <Wallet
                size={21}
                weight="duotone"
                className="text-icon-warning"
              />
            }
          >
            <FeatureRow
              label="Monthly transactions"
              value={subscription.limits.maxBudgetTransactionsPerMonth}
            />
            <FeatureRow
              label="Yearly statistics"
              included={subscription.limits.yearlyBudgetStats}
            />
          </FeatureGroup>
          <FeatureGroup
            title="Photos"
            icon={
              <Image
                size={21}
                weight="duotone"
                className="text-icon-secondary"
              />
            }
          >
            <FeatureRow label="Photos" value={subscription.limits.maxPhotos} />
          </FeatureGroup>
          <FeatureGroup
            title="Pet Care AI"
            icon={
              <Sparkle size={21} weight="duotone" className="text-icon-info" />
            }
          >
            <FeatureRow
              label="AI messages per month"
              value={subscription.limits.aiMessagesPerMonth}
            />
            <FeatureRow
              label="Pet context"
              included={subscription.limits.aiWithPetContext}
            />
            <FeatureRow
              label="Medical history context"
              included={subscription.limits.aiWithMedicalHistory}
            />
          </FeatureGroup>
        </View>

        <View className="gap-10">
          <SectionHeading
            title={isPremium ? "Premium benefits" : "Upgrade to Premium"}
            description={
              isPremium
                ? "Your expanded pet-care tools are ready to use."
                : "More room for daily care, records, memories, and AI support."
            }
          />
          <BenefitsCard premium={isPremium} />
          <Text variant="caption1" className="px-2 text-text-muted">
            Pet Care AI offers general guidance and does not replace veterinary
            diagnosis or treatment.
          </Text>
          {!isPremium ? (
            <Button
              accessibilityLabel="Upgrade to Premium"
              loading={isPresenting}
              onPress={handleUpgrade}
            >
              Upgrade to Premium
            </Button>
          ) : null}
        </View>

        {__DEV__ ? <DeveloperTools subscription={subscription} /> : null}
      </View>
    </ScreenContainer>
  );
}
