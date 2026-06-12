export interface IReminder {
  id: string;
  accountId: string;
  petId: string | null;
  title: string;
  description: string | null;
  type: ReminderType;
  status: ReminderStatus;
  timezone?: string | null;
  repeatFrequency?: ReminderRepeatFrequency;
  repeatInterval?: number | null;
  repeatUntil?: string | null;
  pets?: {
    name: string;
    avatarUrl: string | null;
  } | null;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType =
  | "grooming"
  | "feeding"
  | "vaccination"
  | "medication";

export type ReminderStatus =
  | "pending"
  | "completed"
  | "skipped"
  | "sent"
  | "cancelled";

export type ReminderRepeatFrequency =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export interface GroupedReminder {
  title: string; // 'YYYY-MM-DD'
  data: IReminder[];
}
