import { API_ROUTES } from "@/constants/api-routes";
import { IPetInfoForm } from "@/constants/validation";
import { IPet } from "@/interfaces";
import { APIs } from "./api-helper";

export const createPetMutation = (params: IPetInfoForm) =>
  APIs.post<{ data: IPet }>(API_ROUTES.CREATE_PET, { data: params });
