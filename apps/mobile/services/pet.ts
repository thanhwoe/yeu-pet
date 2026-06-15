import { API_ROUTES } from "@/constants/api-routes";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet } from "@/interfaces";
import { parsePetWeight } from "@/utils/pet";
import dayjs from "dayjs";
import { APIs } from "./api-helper";

const appendTextField = (
  formData: FormData,
  key: string,
  value?: string | null,
) => {
  const trimmedValue = value?.trim();

  if (trimmedValue) {
    formData.append(key, trimmedValue);
  }
};

const appendEditableTextField = (
  formData: FormData,
  key: string,
  value?: string | null,
) => {
  formData.append(key, value?.trim() ?? "");
};

const appendWeightFields = (formData: FormData, weight?: string | null) => {
  const trimmedWeight = weight?.trim();

  if (trimmedWeight) {
    formData.append("weight", trimmedWeight);
  }

  const parsedWeight = parsePetWeight(trimmedWeight);

  if (!parsedWeight) {
    return;
  }

  formData.append("weightValue", String(parsedWeight.weightValue));
  formData.append("weightUnit", parsedWeight.weightUnit);
};

export const createPetMutation = (params: IPetInfoForm) => {
  const formData = new FormData();

  formData.append("name", params.name);
  appendTextField(formData, "color", params.color);
  appendTextField(formData, "gender", params.gender);
  appendTextField(formData, "species", params.species);
  if (params.birthdate) {
    formData.append("birthdate", dayjs(params.birthdate).toISOString());
  }
  appendTextField(formData, "breed", params.breed);
  appendWeightFields(formData, params.weight);
  appendTextField(formData, "notes", params.notes);

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
  appendEditableTextField(formData, "color", params.color);
  appendTextField(formData, "gender", params.gender);
  appendTextField(formData, "species", params.species);

  appendEditableTextField(formData, "breed", params.breed);
  if (params.weight) {
    appendWeightFields(formData, params.weight);
  } else {
    formData.append("weight", "");
  }
  appendEditableTextField(formData, "notes", params.notes);

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
