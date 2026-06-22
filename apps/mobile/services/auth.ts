import { API_ROUTES } from "@/constants/api-routes";
import {
  IResetPasswordForm,
  ISignInForm,
  ISignUpForm,
} from "@/constants/validation";
import { AuthResponse } from "@/interfaces/auth";
import { APIs } from "./api-helper";

export const signUpMutation = (params: ISignUpForm) =>
  APIs.post<AuthResponse>(API_ROUTES.SIGN_UP, { data: params });

export const signInMutation = (params: ISignInForm) =>
  APIs.post<AuthResponse>(API_ROUTES.SIGN_IN, { data: params });

export const signOutMutation = (params?: {
  refreshToken?: string;
  deviceId?: string;
}) => APIs.post(API_ROUTES.LOGOUT, { data: params });

export const requestResetPasswordMutation = (phone: string) =>
  APIs.post<{
    expiresAt: string;
    phone: string;
  }>(API_ROUTES.REQUEST_RESET_PASSWORD, { data: { phone } });

export const resetPasswordMutation = (params: IResetPasswordForm) =>
  APIs.post(API_ROUTES.RESET_PASSWORD, {
    data: {
      phone: params.phone,
      newPassword: params.password,
      code: params.code,
    },
  });
