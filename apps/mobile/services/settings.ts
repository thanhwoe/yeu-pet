import { API_ROUTES } from "@/constants/api-routes";
import { IUserSettings, IUserSettingsForm } from "@/interfaces";
import { APIs } from "./api-helper";

export const getUserSettingsQuery = () =>
  APIs.get<IUserSettings>(API_ROUTES.SETTINGS);

export const updateUserSettingsMutation = (params: IUserSettingsForm) =>
  APIs.put<IUserSettings>(API_ROUTES.SETTINGS, { data: params });
