import { API_ROUTES } from "@/constants/api-routes";
import { IReminderForm } from "@/constants/validation";
import { IReminder } from "@/interfaces";
import { APIs } from "./api-helper";

export const createReminderMutation = (params: IReminderForm) =>
  APIs.post<{ data: any }>(API_ROUTES.CREATE_REMINDER, { data: params });

export const getListReminderQuery = () =>
  APIs.get<{ data: IReminder[] }>(API_ROUTES.REMINDER);

export const updateReminderMutation = ({
  id,
  ...params
}: IReminderForm & { id: string }) =>
  APIs.patch<{ data: any }>(API_ROUTES.UPDATE_REMINDER(id), { data: params });

export const deleteReminderMutation = (id: string) =>
  APIs.delete<{ data: any }>(API_ROUTES.DELETE_REMINDER(id));
