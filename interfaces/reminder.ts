export interface IReminder {
  title: string;
  data: IReminderInfo[];
}

export interface IReminderInfo {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  petId: string;
  petName: string;
  petAvatar: string;
}

export interface IReminderGroup {
  petId: string;
  data: IReminder[];
}
