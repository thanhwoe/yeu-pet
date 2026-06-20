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
      ? "Owner"
      : booking.cancelledBy && booking.cancelledBy === booking.sitter?.accountId
        ? "Sitter"
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
          label={role === "owner" ? "Sitter" : "Owner"}
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
          label="Pet"
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
          label="Date and time"
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
          label="Service"
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
          label="Estimated price"
          value={
            booking.totalPrice ? formatRate(booking.totalPrice) : "To confirm"
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
          label="Request sent"
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
            label="Booking hold"
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
            label="Confirmed"
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
            label="Cancelled"
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
            Notes
          </Heading>
          {booking.careInstructions ? (
            <Body variant="body3" className="text-text-muted">
              Care: {booking.careInstructions}
            </Body>
          ) : null}
          {booking.ownerNotes ? (
            <Body variant="body3" className="text-text-muted">
              Owner: {booking.ownerNotes}
            </Body>
          ) : null}
          {booking.sitterNotes ? (
            <Body variant="body3" className="text-text-muted">
              Sitter: {booking.sitterNotes}
            </Body>
          ) : null}
          {booking.cancelReason ? (
            <Body variant="body3" className="text-text-muted">
              Cancel: {booking.cancelReason}
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
            Message
          </Button>
        ) : null}
        {canSitterRespond ? (
          <>
            <Button
              size="sm"
              loading={loading}
              onPress={() => onAccept(booking)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={loading}
              onPress={() => onReject(booking)}
            >
              Reject
            </Button>
          </>
        ) : null}
        {canComplete ? (
          <Button
            size="sm"
            loading={loading}
            onPress={() => onComplete(booking)}
          >
            Complete
          </Button>
        ) : null}
        {canReview ? (
          <Button size="sm" onPress={() => onReview(booking)}>
            Review
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            size="sm"
            variant="destructive"
            loading={loading}
            onPress={() => onCancel(booking)}
          >
            Cancel
          </Button>
        ) : null}
      </View>
    </View>
  );
};
