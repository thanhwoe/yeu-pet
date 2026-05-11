export interface IReminder {
  id: string;
  accountId: string;
  petId: string;
  title: string;
  description: string | null;
  type: ReminderType;
  status: ReminderStatus;
  pets: {
    name: string;
    avatarUrl: string | null;
  };
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType =
  | "grooming"
  | "feeding"
  | "vaccination"
  | "medication";

export type ReminderStatus = "pending" | "sent" | "cancelled";

export interface GroupedReminder {
  title: string; // 'YYYY-MM-DD'
  data: IReminder[];
}
