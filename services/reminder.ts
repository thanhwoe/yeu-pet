import { API_ROUTES } from "@/constants/api-routes";
import { IReminderForm } from "@/constants/validation";
import { IPagination, IReminder, ReminderStatus } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const createReminderMutation = (params: IReminderForm) =>
  APIs.post<IReminder>(API_ROUTES.REMINDERS, {
    data: params,
  });

interface IReminderQuery {
  status?: ReminderStatus;
  limit?: number;
  page?: number;
}

export const getListReminderQuery = (params?: IReminderQuery) =>
  APIs.get<IPagination<IReminder>>(API_ROUTES.REMINDERS, {
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
