import { API_ROUTES } from "@/constants/api-routes";
import { ISignInForm, ISignUpForm } from "@/constants/validation";
import { IUser } from "@/interfaces/user";
import { APIs } from "./api-helper";

export const signUpMutation = (params: ISignUpForm) =>
  APIs.post<{ data: IUser }>(API_ROUTES.SIGN_UP, { data: params });

export const signInMutation = (params: ISignInForm) =>
  APIs.post<{ data: IUser }>(API_ROUTES.SIGN_IN, { data: params });
