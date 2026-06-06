import { API_ROUTES } from "@/constants/api-routes";
import { IProfileForm } from "@/constants/validation";
import { IDeviceResponse, IUser } from "@/interfaces";
import { APIs } from "./api-helper";

export const completeOnboardingMutation = () =>
  APIs.post<IUser>(API_ROUTES.COMPLETE_ONBOARDING);

export const resendOtpMutation = () =>
  APIs.post<{ expiresAt: string }>(API_ROUTES.RESEND_OTP);

export const verifyOtpMutation = (code: string) =>
  APIs.post<IUser>(API_ROUTES.VERIFY_OTP, { data: { code } });

export const getUserQuery = () => APIs.get<IUser>(API_ROUTES.ME);

export const updateUserProfileMutation = (params: IProfileForm) =>
  APIs.patch<IUser>(API_ROUTES.ME, { data: params });

interface DeviceInfoParams {
  pushToken: string;
  platform: "unknown" | "android" | "ios";
  deviceName?: string;
  osVersion?: string;
}
export const saveDeviceInfoMutation = (params: DeviceInfoParams) =>
  APIs.post<IDeviceResponse>(API_ROUTES.DEVICE, { data: params });

export const deleteDeviceInfoMutation = (id: string) =>
  APIs.delete(API_ROUTES.DEVICE + `/${id}`);
