import { API_ROUTES } from "@/constants/api-routes";
import { IReminderForm } from "@/constants/validation";
import {
  IPagination,
  IReminder,
  ReminderStatus,
  ReminderType,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const createReminderMutation = (params: IReminderForm) =>
  APIs.post<IReminder>(API_ROUTES.REMINDERS, {
    data: params,
  });

interface IReminderQuery {
  status?: ReminderStatus;
  type?: ReminderType;
  limit?: number;
  page?: number;
  petId?: string;
  from?: string;
  to?: string;
}

export const getListReminderQuery = (params?: IReminderQuery) =>
  APIs.get<IPagination<IReminder>>(API_ROUTES.REMINDERS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getUpcomingReminderQuery = (
  params?: Pick<IReminderQuery, "limit">,
) =>
  APIs.get<IPagination<IReminder>>(API_ROUTES.UPCOMING_REMINDERS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const updateReminderMutation = ({
  id,
  ...params
}: IReminderForm & { id: string }) =>
  APIs.patch<{ data: IReminder }>(API_ROUTES.MUTATE_REMINDER(id), {
    data: params,
  });

export const deleteReminderMutation = (id: string) =>
  APIs.delete<{ data: IReminder }>(API_ROUTES.MUTATE_REMINDER(id));

export const cancelReminderMutation = (id: string) =>
  APIs.post<IReminder>(API_ROUTES.CANCEL_REMINDER(id));
