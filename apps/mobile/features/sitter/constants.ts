import { SitterBookingStatus, SitterBookingType } from "@/interfaces";

export const SCREEN_TABS = [
  { title: "Find care", value: 0 },
  { title: "Bookings", value: 1 },
];

export const BOOKING_ROLE_TABS = [
  { title: "Owner", value: 0 },
  { title: "Sitter", value: 1 },
];

export const SERVICE_TYPE_OPTIONS: { label: string; value: SitterBookingType }[] = [
  { label: "Hourly care", value: "hourly" },
  { label: "Daily care", value: "daily" },
];

export const RATING_OPTIONS = [1, 2, 3, 4, 5].map((rating) => ({
  label: `${rating} star${rating > 1 ? "s" : ""}`,
  value: String(rating),
}));

export const STATUS_COPY: Record<SitterBookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const BOOKING_STATUS_FILTERS: {
  label: string;
  value?: SitterBookingStatus;
}[] = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const SITTER_SKELETON_ITEMS = [0, 1, 2, 3];
