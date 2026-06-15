import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ISitterBooking } from "@/interfaces";
import {
  CalendarCheckIcon,
  CurrencyCircleDollarIcon,
  PawPrintIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import { formatDateRange, formatRate, getBookingTitle } from "../utils";
import {
  ExternalPaymentNotice,
  InfoRow,
  StatusBadge,
} from "./SitterPrimitives";

const CalendarCheck = withIconClassName(CalendarCheckIcon);
const CurrencyCircleDollar = withIconClassName(CurrencyCircleDollarIcon);
const PawPrint = withIconClassName(PawPrintIcon);

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
  const canReview = role === "owner" && booking.status === "completed";

  return (
    <View className="gap-18">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h5" weight="bold">
            {getBookingTitle(booking, role)}
          </Heading>
          <Body variant="body3" className="text-text-muted">
            {booking.pet?.name ?? "Pet"} ·{" "}
            {booking.type === "hourly" ? "Hourly care" : "Daily care"}
          </Body>
        </View>
        <StatusBadge status={booking.status} />
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
        <InfoRow
          icon={
            <PawPrint
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label="Pet"
          value={booking.pet?.name ?? "Pet"}
        />
      </View>

      {booking.careInstructions || booking.ownerNotes || booking.sitterNotes ? (
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
        </View>
      ) : null}

      <ExternalPaymentNotice compact />

      <View className="flex-row flex-wrap gap-10">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onOpenMessages(booking)}
        >
          Message
        </Button>
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
