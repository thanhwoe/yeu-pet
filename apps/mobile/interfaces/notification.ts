export interface INotification {
  id: string;
  accountId: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  imageId: string | null;
  deepLink: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean | null;
  readAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface INotificationBadge {
  count: number;
}
