import { Skeleton } from "@/components/Skeleton";
import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { SitterBookingStatus } from "@/interfaces";
import { cn } from "@/utils";
import { CurrencyCircleDollarIcon } from "phosphor-react-native";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { getBookingStatusLabel, SITTER_SKELETON_ITEMS } from "../constants";

const CurrencyCircleDollar = withIconClassName(CurrencyCircleDollarIcon);

export const StatusBadge = ({ status }: { status: SitterBookingStatus }) => {
  const className: Record<SitterBookingStatus, string> = {
    pending: "border-status-warning-border bg-status-warning-surface",
    confirmed: "border-status-info-border bg-status-info-surface",
    active: "border-status-info-border bg-status-info-surface",
    completed: "border-status-success-border bg-status-success-surface",
    cancelled: "border-status-danger-border bg-status-danger-surface",
    rejected: "border-status-danger-border bg-status-danger-surface",
  };

  const textClassName: Record<SitterBookingStatus, string> = {
    pending: "text-status-warning-text",
    confirmed: "text-status-info-text",
    active: "text-status-info-text",
    completed: "text-status-success-text",
    cancelled: "text-status-danger-text",
    rejected: "text-status-danger-text",
  };

  return (
    <View className={cn("rounded-full border px-10 py-5", className[status])}>
      <Body variant="body5" weight="semiBold" className={textClassName[status]}>
        {getBookingStatusLabel(status)}{" "}
      </Body>
    </View>
  );
};

export const AvailabilityBadge = ({ available }: { available: boolean }) => {
  const { t } = useTranslation();

  return (
    <View
      className={cn(
        "rounded-full border px-10 py-5",
        available
          ? "border-status-success-border bg-status-success-surface"
          : "border-line-subtle bg-background-surface-muted",
      )}
    >
      <Body
        variant="body5"
        weight="semiBold"
        className={available ? "text-status-success-text" : "text-text-muted"}
      >
        {available
          ? t("sitter.availability.available")
          : t("sitter.availability.paused")}
      </Body>
    </View>
  );
};

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Body variant="body5" caps className="text-text-muted">
    {children}
  </Body>
);

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start gap-10">
    <View className="mt-1 h-28 w-28 items-center justify-center rounded-full bg-background-surface-muted">
      {icon}
    </View>
    <View className="flex-1">
      <Body variant="body4" className="text-text-muted">
        {label}
      </Body>
      <Body variant="body3" weight="semiBold">
        {value}
      </Body>
    </View>
  </View>
);

export const ExternalPaymentNotice = ({
  compact = false,
  note,
}: {
  compact?: boolean;
  note?: string | null;
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-10 rounded-18 border border-line-subtle bg-background-surface-muted px-14 py-12">
      <CurrencyCircleDollar
        size={22}
        weight="duotone"
        className="mt-1 text-feature-sitter-accent"
      />
      <View className="flex-1">
        <Body variant="body3" weight="semiBold">
          {t("sitter.booking.detail.externalPayment")}
        </Body>
        {note || !compact ? (
          <Body variant="body4" className="mt-2 text-text-muted">
            {note ?? t("sitter.booking.detail.externalPaymentNotice")}
          </Body>
        ) : null}
      </View>
    </View>
  );
};

export const SitterSkeleton = () => {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t("sitter.accessibility.loadingSitters")}
      className="gap-16 mt-20"
    >
      {SITTER_SKELETON_ITEMS.map((index) => (
        <Skeleton
          key={index}
          className="h-136 rounded-24"
          backgroundClassName="bg-background-surface"
        />
      ))}
    </View>
  );
};

export const BookingListSkeleton = () => {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t("sitter.accessibility.loadingBookings")}
      className="flex-1 gap-12 overflow-hidden pt-8 pb-safe"
    >
      {SITTER_SKELETON_ITEMS.slice(0, 3).map((index) => (
        <Skeleton
          key={index}
          className="h-136 rounded-24"
          backgroundClassName="bg-background-surface"
        />
      ))}
    </View>
  );
};
