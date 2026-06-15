import { IPet, IPetSitter, ISitterBooking } from "@/interfaces";
import { formatCurrency } from "@/utils";
import dayjs from "dayjs";

export const formatRate = (value: string | number) =>
  formatCurrency(Number(value || 0), "₫", "vi-VN");

export const formatDateTime = (value: string) => dayjs(value).format("DD MMM, HH:mm");

export const formatDateRange = (booking: ISitterBooking) => {
  if (booking.type === "daily") {
    const start = dayjs(booking.startTime).format("DD MMM");
    const end = dayjs(booking.endTime).format("DD MMM YYYY");
    return `${start} - ${end}`;
  }

  return `${formatDateTime(booking.startTime)} - ${dayjs(booking.endTime).format("HH:mm")}`;
};

export const getSitterName = (sitter: IPetSitter) => {
  const accountName = [sitter.account?.firstName, sitter.account?.lastName]
    .filter(Boolean)
    .join(" ");

  return sitter.displayName || accountName || "Pet sitter";
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
    return booking.sitter ? getSitterName(booking.sitter) : "Sitter booking";
  }

  return booking.pet?.name
    ? `${booking.pet.name}'s care request`
    : "Care request";
};

export const createIdempotencyKey = () =>
  `mobile-sitter-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
