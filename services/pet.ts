import { API_ROUTES } from "@/constants/api-routes";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet } from "@/interfaces";
import dayjs from "dayjs";
import { APIs } from "./api-helper";

export const createPetMutation = (params: IPetInfoForm) => {
  const formData = new FormData();

  formData.append("name", params.name);
  formData.append("color", params.color);
  formData.append("gender", params.gender);
  formData.append("species", params.species);
  if (params.birthdate) {
    formData.append("birthdate", dayjs(params.birthdate).toISOString());
  }
  if (params.breed) {
    formData.append("breed", params.breed);
  }
  if (params.weight) {
    formData.append("weight", params.weight);
  }
  if (params.notes) {
    formData.append("notes", params.notes);
  }

  formData.append("avatar", {
    uri: params.avatar?.uri,
    name: params.avatar?.name,
    type: params.avatar?.type,
    size: params.avatar?.size,
  } as any);

  return APIs.post<{ data: IPet }>(API_ROUTES.PETS, {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

export const getListPetQuery = () =>
  APIs.get<IPagination<IPet>>(API_ROUTES.PETS);

export const updatePetMutation = ({
  pet_id,
  ...params
}: IPetInfoForm & { pet_id: string }) =>
  APIs.patch<{ data: IPet }>(API_ROUTES.UPDATE_PET(pet_id), { data: params });

export const deletePetMutation = (pet_id: string) =>
  APIs.delete<{ data: IPet }>(API_ROUTES.DELETE_PET(pet_id));
