export interface IUserSettings {
  accountId: string;
  notificationEnable: boolean;
  reminderNotifications: boolean;
  bookingNotifications: boolean;
  socialNotifications: boolean;
  aiNotifications: boolean;
  language: string;
  theme: "system" | "light" | "dark";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IUserSettingsForm {
  notificationEnable?: boolean;
  reminderNotifications?: boolean;
  bookingNotifications?: boolean;
  socialNotifications?: boolean;
  aiNotifications?: boolean;
  language?: string;
  theme?: "system" | "light" | "dark";
}
