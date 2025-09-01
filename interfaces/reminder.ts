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

export interface IReminderResponse {
  account_id: string;
  created_at: string;
  description: string;
  event_date: string;
  id: string;
  pet_id: string;
  title: string;
  type: string;
  updated_at: string;
}