import { API_ROUTES } from "@/constants/api-routes";
import {
  IDeviceResponse,
  IAvatarUploadResponse,
  IEmailChangeRequest,
  IUpdateProfileParams,
  IUser,
  IVerifyEmailChangeResponse,
  UploadFileParam,
} from "@/interfaces";
import { APIs } from "./api-helper";

export const completeOnboardingMutation = () =>
  APIs.post<IUser>(API_ROUTES.COMPLETE_ONBOARDING);

export const resendOtpMutation = () =>
  APIs.post<{ expiresAt: string }>(API_ROUTES.RESEND_OTP);

export const verifyOtpMutation = (code: string) =>
  APIs.post<IUser>(API_ROUTES.VERIFY_OTP, { data: { code } });

export const getUserQuery = () => APIs.get<IUser>(API_ROUTES.ME);

export const updateMeProfileMutation = (params: IUpdateProfileParams) =>
  APIs.patch<IUser>(API_ROUTES.ME, { data: params });

export const uploadMeAvatarMutation = (avatar: UploadFileParam) => {
  const formData = new FormData();
  formData.append("avatar", {
    uri: avatar.uri,
    name: avatar.name,
    type: avatar.type,
  } as unknown as Blob);

  return APIs.post<IAvatarUploadResponse>(API_ROUTES.ME_AVATAR, {
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteMeAvatarMutation = () =>
  APIs.delete<IUser>(API_ROUTES.ME_AVATAR);

export const deleteAccountMutation = (params: { password: string }) =>
  APIs.delete<void>(API_ROUTES.ME, { data: params });

export const requestEmailChangeMutation = (params: { newEmail: string }) =>
  APIs.post<IEmailChangeRequest>(API_ROUTES.ME_EMAIL_CHANGE_REQUEST, {
    data: params,
  });

export const verifyEmailChangeMutation = (params: {
  requestId: string;
  otp: string;
}) =>
  APIs.post<IVerifyEmailChangeResponse>(API_ROUTES.ME_EMAIL_CHANGE_VERIFY, {
    data: params,
  });

export const resendEmailChangeOtpMutation = (params: { requestId: string }) =>
  APIs.post<IEmailChangeRequest>(API_ROUTES.ME_EMAIL_CHANGE_RESEND, {
    data: params,
  });

export const cancelEmailChangeMutation = (params: { requestId: string }) =>
  APIs.post<IEmailChangeRequest>(API_ROUTES.ME_EMAIL_CHANGE_CANCEL, {
    data: params,
  });

interface DeviceInfoParams {
  pushToken: string;
  installationId: string;
  registrationGeneration: number;
  platform: "unknown" | "android" | "ios";
  deviceName?: string;
  osVersion?: string;
}
export const saveDeviceInfoMutation = (params: DeviceInfoParams) =>
  APIs.post<IDeviceResponse>(API_ROUTES.DEVICE, { data: params });

export const deleteDeviceInfoMutation = (id: string) =>
  APIs.delete(API_ROUTES.DEVICE + `/${id}`);
