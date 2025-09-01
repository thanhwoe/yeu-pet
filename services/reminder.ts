import { API_ROUTES } from "@/constants/api-routes";
import { IReminderForm } from "@/constants/validation";
import { IReminder, IReminderResponse } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const createReminderMutation = (params: IReminderForm) =>
  APIs.post<{ data: IReminderResponse }>(API_ROUTES.CREATE_REMINDER, { data: params });

interface IReminderQuery {
  pet?: string;
  limit?: number;
}

export const getListReminderQuery = (params?: IReminderQuery) =>
  APIs.get<{ data: IReminder[] }>(API_ROUTES.REMINDER, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const updateReminderMutation = ({
  id,
  ...params
}: IReminderForm & { id: string }) =>
  APIs.patch<{ data: IReminderResponse }>(API_ROUTES.UPDATE_REMINDER(id), { data: params });

export const deleteReminderMutation = (id: string) =>
  APIs.delete<{ data: IReminderResponse }>(API_ROUTES.DELETE_REMINDER(id));
