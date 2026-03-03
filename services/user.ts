import { API_ROUTES } from "@/constants/api-routes";
import { IUser } from "@/interfaces";
import { APIs } from "./api-helper";

export const completeOnboardingMutation = () =>
  APIs.post<IUser>(API_ROUTES.COMPLETE_ONBOARDING);
