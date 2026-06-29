import { i18n } from "@/i18n";
import { SitterBookingStatus, SitterBookingType } from "@/interfaces";

export const getScreenTabs = () => [
  { title: i18n.t("sitter.booking.tabs.findCare"), value: 0 },
  { title: i18n.t("sitter.booking.tabs.bookings"), value: 1 },
];

export const getBookingRoleTabs = () => [
  { title: i18n.t("sitter.booking.roles.owner"), value: 0 },
  { title: i18n.t("sitter.booking.roles.sitter"), value: 1 },
];

export const getServiceTypeOptions = (): {
  label: string;
  value: SitterBookingType;
}[] => [
  { label: i18n.t("sitter.serviceTypes.hourly"), value: "hourly" },
  { label: i18n.t("sitter.serviceTypes.daily"), value: "daily" },
];

export const getRatingOptions = () => [1, 2, 3, 4, 5].map((rating) => ({
  label: i18n.t("sitter.form.ratingOption", { count: rating }),
  value: String(rating),
}));

const STATUS_KEYS: Record<SitterBookingStatus, string> = {
  pending: "sitter.booking.statuses.pending",
  confirmed: "sitter.booking.statuses.confirmed",
  active: "sitter.booking.statuses.active",
  completed: "sitter.booking.statuses.completed",
  cancelled: "sitter.booking.statuses.cancelled",
  rejected: "sitter.booking.statuses.rejected",
};

export const getBookingStatusLabel = (status: SitterBookingStatus) =>
  i18n.t(STATUS_KEYS[status]);

export const getBookingStatusFilters = (): {
  label: string;
  value?: SitterBookingStatus;
}[] => [
  { label: i18n.t("sitter.booking.statuses.all") },
  { label: i18n.t("sitter.booking.statuses.pending"), value: "pending" },
  { label: i18n.t("sitter.booking.statuses.confirmed"), value: "confirmed" },
  { label: i18n.t("sitter.booking.statuses.completed"), value: "completed" },
  { label: i18n.t("sitter.booking.statuses.cancelled"), value: "cancelled" },
];

export const SITTER_SKELETON_ITEMS = [0, 1, 2, 3];
