import { API_ROUTES } from "@/constants/api-routes";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet } from "@/interfaces";
import { parsePetWeight } from "@/utils/pet";
import dayjs from "dayjs";
import { APIs } from "./api-helper";

const appendWeightFields = (formData: FormData, weight?: string | null) => {
  if (weight) {
    formData.append("weight", weight);
  }

  const parsedWeight = parsePetWeight(weight);

  if (!parsedWeight) {
    return;
  }

  formData.append("weightValue", String(parsedWeight.weightValue));
  formData.append("weightUnit", parsedWeight.weightUnit);
};

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
  appendWeightFields(formData, params.weight);
  if (params.notes) {
    formData.append("notes", params.notes);
  }

  if (params.avatar) {
    formData.append("avatar", {
      uri: params.avatar?.uri,
      name: params.avatar?.name,
      type: params.avatar?.type,
      size: params.avatar?.size,
    } as any);
  }

  return APIs.post<IPet>(API_ROUTES.PETS, {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

export const getListPetQuery = () =>
  APIs.get<IPagination<IPet>>(API_ROUTES.PETS);

export const updatePetMutation = ({
  id,
  ...params
}: IPetInfoForm & { id: string }) => {
  const formData = new FormData();

  formData.append("name", params.name);
  formData.append("color", params.color);
  formData.append("gender", params.gender);
  formData.append("species", params.species);

  formData.append("breed", params.breed ?? "");
  if (params.weight) {
    appendWeightFields(formData, params.weight);
  } else {
    formData.append("weight", "");
  }
  formData.append("notes", params.notes ?? "");

  if (params.birthdate) {
    formData.append("birthdate", dayjs(params.birthdate).toISOString());
  }

  if (params.avatar && params.avatar.name !== "default") {
    formData.append("avatar", {
      uri: params.avatar?.uri,
      name: params.avatar?.name,
      type: params.avatar?.type,
      size: params.avatar?.size,
    } as any);
  }

  return APIs.patch<IPet>(API_ROUTES.MUTATE_PET(id), {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

export const deletePetMutation = (id: string) =>
  APIs.delete(API_ROUTES.MUTATE_PET(id));
