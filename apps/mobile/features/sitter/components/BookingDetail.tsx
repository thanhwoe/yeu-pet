import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ISitterBooking } from "@/interfaces";
import {
  CalendarCheckIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  PawPrintIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  formatBookingHold,
  formatDateRange,
  formatDateTime,
  formatRate,
  getBookingPetName,
  getBookingServiceLabel,
  getBookingSitterName,
  getBookingTitle,
  getOwnerName,
} from "../utils";
import { InfoRow, StatusBadge } from "./SitterPrimitives";

const CalendarCheck = withIconClassName(CalendarCheckIcon);
const Clock = withIconClassName(ClockIcon);
const CurrencyCircleDollar = withIconClassName(CurrencyCircleDollarIcon);
const PawPrint = withIconClassName(PawPrintIcon);
const UserCircle = withIconClassName(UserCircleIcon);

export const BookingDetail = ({
  booking,
  role,
  loading,
  onOpenMessages,
  onCancel,
  onAccept,
  onReject,
  onComplete,
  onReview,
}: {
  booking: ISitterBooking;
  role: "owner" | "sitter";
  loading: boolean;
  onOpenMessages: (booking: ISitterBooking) => void;
  onCancel: (booking: ISitterBooking) => void;
  onAccept: (booking: ISitterBooking) => void;
  onReject: (booking: ISitterBooking) => void;
  onComplete: (booking: ISitterBooking) => void;
  onReview: (booking: ISitterBooking) => void;
}) => {
  const { t } = useTranslation();
  const canSitterRespond = role === "sitter" && booking.status === "pending";
  const canComplete =
    role === "sitter" && ["confirmed", "active"].includes(booking.status);
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const canMessage = ["confirmed", "active", "completed"].includes(
    booking.status,
  );
  const canReview = role === "owner" && booking.status === "completed";

  const holdLabel = formatBookingHold(booking);
  const cancelledByLabel =
    booking.cancelledBy === booking.accountId
      ? t("sitter.booking.detail.owner")
      : booking.cancelledBy && booking.cancelledBy === booking.sitter?.accountId
        ? t("sitter.booking.detail.sitter")
        : undefined;

  return (
    <View className="gap-18 px-16">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h5" weight="bold">
            {getBookingTitle(booking, role)}
          </Heading>
          <Body variant="body3" className="text-text-muted">
            {getBookingPetName(booking)} · {getBookingServiceLabel(booking)}
          </Body>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <InfoRow
          icon={
            <UserCircle
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={
            role === "owner"
              ? t("sitter.booking.detail.sitter")
              : t("sitter.booking.detail.owner")
          }
          value={
            role === "owner"
              ? getBookingSitterName(booking)
              : getOwnerName(booking.owner)
          }
        />
        <InfoRow
          icon={
            <PawPrint
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.booking.detail.pet")}
          value={getBookingPetName(booking)}
        />
      </View>

      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <InfoRow
          icon={
            <CalendarCheck
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.booking.detail.dateAndTime")}
          value={formatDateRange(booking)}
        />
        <InfoRow
          icon={
            <Clock
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.booking.detail.service")}
          value={getBookingServiceLabel(booking)}
        />
        <InfoRow
          icon={
            <CurrencyCircleDollar
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.booking.detail.estimatedPrice")}
          value={
            booking.totalPrice
              ? formatRate(booking.totalPrice)
              : t("sitter.booking.detail.toConfirm")
          }
        />
      </View>

      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <InfoRow
          icon={
            <Clock
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.booking.detail.requestSent")}
          value={formatDateTime(booking.createdAt)}
        />
        {holdLabel ? (
          <InfoRow
            icon={
              <Clock
                size={16}
                weight="duotone"
                className="text-feature-sitter-accent"
              />
            }
            label={t("sitter.booking.detail.bookingHold")}
            value={holdLabel}
          />
        ) : null}
        {booking.confirmedAt ? (
          <InfoRow
            icon={
              <CalendarCheck
                size={16}
                weight="duotone"
                className="text-feature-sitter-accent"
              />
            }
            label={t("sitter.booking.detail.confirmed")}
            value={formatDateTime(booking.confirmedAt)}
          />
        ) : null}
        {booking.cancelledAt ? (
          <InfoRow
            icon={
              <Clock
                size={16}
                weight="duotone"
                className="text-feature-sitter-accent"
              />
            }
            label={t("sitter.booking.detail.cancelled")}
            value={
              cancelledByLabel
                ? `${formatDateTime(booking.cancelledAt)} · ${cancelledByLabel}`
                : formatDateTime(booking.cancelledAt)
            }
          />
        ) : null}
      </View>

      {booking.careInstructions ||
      booking.ownerNotes ||
      booking.sitterNotes ||
      booking.cancelReason ? (
        <View className="gap-10 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
          <Heading variant="h6" weight="bold">
            {t("sitter.booking.detail.notes")}
          </Heading>
          {booking.careInstructions ? (
            <Body variant="body3" className="text-text-muted">
              {t("sitter.booking.detail.carePrefix", {
                instructions: booking.careInstructions,
              })}
            </Body>
          ) : null}
          {booking.ownerNotes ? (
            <Body variant="body3" className="text-text-muted">
              {t("sitter.booking.detail.ownerPrefix", {
                notes: booking.ownerNotes,
              })}
            </Body>
          ) : null}
          {booking.sitterNotes ? (
            <Body variant="body3" className="text-text-muted">
              {t("sitter.booking.detail.sitterPrefix", {
                notes: booking.sitterNotes,
              })}
            </Body>
          ) : null}
          {booking.cancelReason ? (
            <Body variant="body3" className="text-text-muted">
              {t("sitter.booking.detail.cancelPrefix", {
                reason: booking.cancelReason,
              })}
            </Body>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-10 justify-center">
        {canMessage ? (
          <Button
            size="sm"
            variant="secondary"
            onPress={() => onOpenMessages(booking)}
          >
            {t("sitter.booking.actions.message")}
          </Button>
        ) : null}
        {canSitterRespond ? (
          <>
            <Button
              size="sm"
              loading={loading}
              onPress={() => onAccept(booking)}
            >
              {t("sitter.booking.actions.accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={loading}
              onPress={() => onReject(booking)}
            >
              {t("sitter.booking.actions.reject")}
            </Button>
          </>
        ) : null}
        {canComplete ? (
          <Button
            size="sm"
            loading={loading}
            onPress={() => onComplete(booking)}
          >
            {t("sitter.booking.actions.complete")}
          </Button>
        ) : null}
        {canReview ? (
          <Button size="sm" onPress={() => onReview(booking)}>
            {t("sitter.booking.actions.review")}
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            size="sm"
            variant="destructive"
            loading={loading}
            onPress={() => onCancel(booking)}
          >
            {t("sitter.booking.actions.cancel")}
          </Button>
        ) : null}
      </View>
    </View>
  );
};
