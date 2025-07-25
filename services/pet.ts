import { API_ROUTES } from "@/constants/api-routes";
import { IPetInfoForm } from "@/constants/validation";
import { IPet } from "@/interfaces";
import { APIs } from "./api-helper";

export const createPetMutation = (params: IPetInfoForm) =>
  APIs.post<{ data: IPet }>(API_ROUTES.CREATE_PET, { data: params });

export const getListPetQuery = () =>
  APIs.get<{ data: IPet[] }>(API_ROUTES.LIST_PET);

export const updatePetMutation = ({
  pet_id,
  ...params
}: IPetInfoForm & { pet_id: string }) =>
  APIs.patch<{ data: IPet }>(API_ROUTES.UPDATE_PET(pet_id), { data: params });

export const deletePetMutation = (pet_id: string) =>
  APIs.delete<{ data: IPet }>(API_ROUTES.DELETE_PET(pet_id));
