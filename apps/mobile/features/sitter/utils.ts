import {
  IPet,
  IPetSitter,
  ISitterBooking,
  ISitterBookingParty,
} from "@/interfaces";
import { formatCurrency } from "@/utils";
import dayjs from "dayjs";

export const formatRate = (value: string | number) =>
  formatCurrency(Number(value || 0), "₫", "vi-VN");

const formatShortId = (value?: string | null) =>
  value ? value.slice(0, 8) : undefined;

const getFullName = (party?: {
  firstName?: string | null;
  lastName?: string | null;
} | null) =>
  [party?.firstName, party?.lastName].filter(Boolean).join(" ").trim() ||
  undefined;

export const formatDateTime = (value?: string | null) => {
  if (!value) return "Not set";

  const date = dayjs(value);

  return date.isValid() ? date.format("DD MMM YYYY, HH:mm") : "Not set";
};

export const formatDateRange = (booking: ISitterBooking) => {
  const start = dayjs(booking.startTime);
  const end = dayjs(booking.endTime);

  if (!start.isValid() || !end.isValid()) {
    return "Time to confirm";
  }

  if (booking.type === "daily") {
    return start.isSame(end, "day")
      ? start.format("DD MMM YYYY")
      : `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`;
  }

  return start.isSame(end, "day")
    ? `${start.format("DD MMM YYYY, HH:mm")} - ${end.format("HH:mm")}`
    : `${start.format("DD MMM YYYY, HH:mm")} - ${end.format(
        "DD MMM YYYY, HH:mm",
      )}`;
};

export const getSitterName = (sitter: IPetSitter) => {
  const accountName = [sitter.account?.firstName, sitter.account?.lastName]
    .filter(Boolean)
    .join(" ");

  return sitter.displayName || accountName || "Pet sitter";
};

export const getOwnerName = (owner?: ISitterBookingParty | null) =>
  getFullName(owner) || "Pet owner";

export const getBookingPetName = (booking: ISitterBooking) =>
  booking.pet?.name || `Pet ${formatShortId(booking.petId) ?? ""}`.trim();

export const getBookingSitterName = (booking: ISitterBooking) =>
  booking.sitter
    ? getSitterName(booking.sitter)
    : `Sitter ${formatShortId(booking.sitterId) ?? ""}`.trim();

export const getBookingServiceLabel = (booking: ISitterBooking) =>
  booking.type === "hourly" ? "Hourly care" : "Daily care";

export const formatBookingHold = (booking: ISitterBooking) => {
  if (booking.status !== "pending" || !booking.expiresAt) return undefined;

  const expiresAt = dayjs(booking.expiresAt);

  return expiresAt.isValid()
    ? `Hold expires ${expiresAt.format("DD MMM, HH:mm")}`
    : undefined;
};

export const getPetAvatar = (pet?: IPet) => {
  if (!pet?.avatarUrl) return undefined;
  return { uri: pet.avatarUrl };
};

export const getLocationLine = (sitter: IPetSitter) =>
  [sitter.ward, sitter.district, sitter.city].filter(Boolean).join(", ") ||
  sitter.address;

export const getReadableText = (value?: string | null) => {
  const text = value?.trim();
  return text && text.length >= 8 ? text : undefined;
};

export const getServiceSummary = (sitter: IPetSitter) =>
  getReadableText(sitter.serviceNotes) ||
  getReadableText(sitter.bio) ||
  "Pet care by hour or day.";

export const getBookingTitle = (
  booking: ISitterBooking,
  role: "owner" | "sitter",
) => {
  if (role === "owner") {
    return getBookingSitterName(booking);
  }

  return booking.pet?.name
    ? `${booking.pet.name}'s care request`
    : "Care request";
};

export const createIdempotencyKey = () =>
  `mobile-sitter-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
