import { API_ROUTES } from "@/constants/api-routes";
import { ISignInForm, ISignUpForm } from "@/constants/validation";
import { AuthResponse } from "@/interfaces/auth";
import { APIs } from "./api-helper";

export const signUpMutation = (params: ISignUpForm) =>
  APIs.post<AuthResponse>(API_ROUTES.SIGN_UP, { data: params });

export const signInMutation = (params: ISignInForm) =>
  APIs.post<AuthResponse>(API_ROUTES.SIGN_IN, { data: params });

export const signOutMutation = (params?: { refreshToken?: string }) =>
  APIs.post(API_ROUTES.LOGOUT, { data: params });
