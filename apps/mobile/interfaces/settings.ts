export interface IUserSettings {
  accountId: string;
  notificationEnable: boolean;
  language: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IUserSettingsForm {
  notificationEnable?: boolean;
  language?: string;
}
