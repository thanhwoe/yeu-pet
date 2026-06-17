import { Avatar } from "@/components/ui/Avatar";
import { Body, Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPetSitter, ISitterBooking, SitterBookingStatus } from "@/interfaces";
import { cn } from "@/utils";
import {
  ClockIcon,
  CurrencyCircleDollarIcon,
  StarIcon,
} from "phosphor-react-native";
import { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { BOOKING_STATUS_FILTERS } from "../constants";
import {
  formatBookingHold,
  formatDateRange,
  formatRate,
  getBookingPetName,
  getBookingServiceLabel,
  getBookingTitle,
  getLocationLine,
  getPetAvatar,
  getServiceSummary,
  getSitterName,
} from "../utils";
import { AvailabilityBadge, StatusBadge } from "./SitterPrimitives";

const Clock = withIconClassName(ClockIcon);
const CurrencyCircleDollar = withIconClassName(CurrencyCircleDollarIcon);
const Star = withIconClassName(StarIcon);

export const SitterCard = memo(
  ({
    sitter,
    onPress,
  }: {
    sitter: IPetSitter;
    onPress: (sitter: IPetSitter) => void;
  }) => {
    const rating = Number(sitter.avgRating || 0).toFixed(1);

    return (
      <Pressable
        onPress={() => onPress(sitter)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${getSitterName(sitter)} sitter profile`}
        className="rounded-24 border border-line-subtle bg-background-surface px-16 py-16 shadow-sm"
      >
        <View className="flex-row items-start gap-12">
          <Avatar
            size="large"
            source={{
              uri: sitter.account?.avatarUrl ?? undefined,
            }}
          />
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-10">
              <View className="flex-1">
                <Heading variant="h6" weight="bold" numberOfLines={1}>
                  {getSitterName(sitter)}
                </Heading>
                <Body
                  variant="body4"
                  numberOfLines={1}
                  className="text-text-muted"
                >
                  {getLocationLine(sitter)}
                </Body>
              </View>
              <View className="flex-row items-center gap-4">
                <Star
                  size={15}
                  weight="fill"
                  className="text-status-warning-icon"
                />
                <Body variant="body4" weight="semiBold">
                  {rating}
                </Body>
              </View>
            </View>
            <View className="mt-8 self-start">
              <AvailabilityBadge available={sitter.isAvailable} />
            </View>
          </View>
        </View>

        <Body
          variant="body4"
          numberOfLines={2}
          className="mt-12 text-text-muted"
        >
          {getServiceSummary(sitter)}
        </Body>

        <View className="mt-14 flex-row gap-10">
          <View className="flex-1 rounded-18 bg-background-surface-muted px-12 py-10">
            <Body variant="body5" caps className="text-text-muted">
              Hourly
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.hourlyRate)}
            </Body>
          </View>
          <View className="flex-1 rounded-18 bg-background-surface-muted px-12 py-10">
            <Body variant="body5" caps className="text-text-muted">
              Daily
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.dailyRate)}
            </Body>
          </View>
        </View>
      </Pressable>
    );
  },
);

SitterCard.displayName = "SitterCard";

export const BookingCard = ({
  booking,
  role,
  onPress,
}: {
  booking: ISitterBooking;
  role: "owner" | "sitter";
  onPress: (booking: ISitterBooking) => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Open ${getBookingTitle(booking, role)} booking`}
    onPress={() => onPress(booking)}
    className="rounded-24 border border-line-subtle mb-8 bg-background-surface px-16 py-16"
  >
    <View className="flex-row items-start gap-12">
      <Avatar size="medium" source={getPetAvatar(booking.pet)} />
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-10">
          <View className="flex-1">
            <Heading variant="h6" weight="bold" numberOfLines={1}>
              {getBookingTitle(booking, role)}
            </Heading>
            <Body variant="body4" className="text-text-muted">
              {getBookingPetName(booking)} · {getBookingServiceLabel(booking)}
            </Body>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        <View className="mt-12 gap-6">
          <View className="flex-row items-center gap-8">
            <Clock size={16} className="text-icon-secondary" />
            <Body variant="body4">{formatDateRange(booking)}</Body>
          </View>
          <View className="flex-row items-center gap-8">
            <CurrencyCircleDollar size={16} className="text-icon-secondary" />
            <Body variant="body4" className="text-text-muted">
              {booking.totalPrice
                ? formatRate(booking.totalPrice)
                : "Price to confirm"}{" "}
              · External payment
            </Body>
          </View>
          {formatBookingHold(booking) ? (
            <Body variant="body5" className="text-text-muted">
              {formatBookingHold(booking)}
            </Body>
          ) : null}
        </View>
      </View>
    </View>
  </Pressable>
);

export const StatusFilterRow = ({
  value,
  onChange,
}: {
  value?: SitterBookingStatus;
  onChange: (value?: SitterBookingStatus) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="mb-12 max-h-44"
    contentContainerStyle={{ flexDirection: "row", gap: 8 }}
  >
    {BOOKING_STATUS_FILTERS.map((item) => {
      const active = item.value === value;

      return (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          onPress={() => onChange(item.value)}
          className={cn(
            "h-40 justify-center rounded-full border border-line-subtle bg-background-surface px-14",
            active && "border-action-primary bg-action-primary",
          )}
        >
          <Body
            variant="body4"
            weight="semiBold"
            className={
              active ? "text-action-primary-foreground" : "text-text-muted"
            }
          >
            {item.label}
          </Body>
        </Pressable>
      );
    })}
  </ScrollView>
);
