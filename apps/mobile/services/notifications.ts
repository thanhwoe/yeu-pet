import { API_ROUTES } from "@/constants/api-routes";
import { INotification, INotificationBadge, IPagination } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface INotificationQuery {
  limit?: number;
  page?: number;
}

export const getNotificationsQuery = (params?: INotificationQuery) =>
  APIs.get<IPagination<INotification>>(API_ROUTES.NOTIFICATIONS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getNotificationBadgeQuery = () =>
  APIs.get<INotificationBadge>(API_ROUTES.NOTIFICATION_BADGE);

export const markNotificationReadMutation = (id: string) =>
  APIs.patch<void>(API_ROUTES.MARK_NOTIFICATION_READ(id));

export const markAllNotificationsReadMutation = () =>
  APIs.post<void>(API_ROUTES.MARK_ALL_NOTIFICATIONS_READ);

export const deleteNotificationMutation = (id: string) =>
  APIs.delete<void>(API_ROUTES.DELETE_NOTIFICATION(id));
