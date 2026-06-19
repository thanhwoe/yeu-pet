import { API_ROUTES } from "@/constants/api-routes";
import { IMedicalRecordForm } from "@/constants/validation";
import {
  IMedicalRecord,
  IMedicalRecordDetail,
  IPagination,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import dayjs from "dayjs";
import { APIs } from "./api-helper";

interface IMedicalRecordQueryParams {
  petId: string;
  page?: number;
  limit?: number;
}

export const getMedicalRecordsByPetIdQuery = ({
  petId,
  ...params
}: IMedicalRecordQueryParams) =>
  APIs.get<IPagination<IMedicalRecord>>(
    API_ROUTES.MEDICAL_RECORDS_FOR_PET(petId),
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );

export const getMedicalRecordDetailQuery = (id: string) =>
  APIs.get<IMedicalRecordDetail>(API_ROUTES.MEDICAL_RECORD_DETAIL(id));

export const createMedicalRecordMutation = (data: IMedicalRecordForm) => {
  const formData = new FormData();

  formData.append("recordType", data.recordType);
  formData.append("title", data.title);
  formData.append("date", dayjs(data.date).toISOString());

  data.description && formData.append("description", data.description);
  data.vetClinic && formData.append("vetClinic", data.vetClinic);
  data.vetName && formData.append("vetName", data.vetName);

  data.attachments?.forEach((attachment) => {
    formData.append("attachments", {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
    } as any);
  });

  return APIs.post<IMedicalRecord>(
    API_ROUTES.MEDICAL_RECORDS_FOR_PET(data.petId),
    {
      data: formData,
      headers: { "content-type": "multipart/form-data" },
    },
  );
};

export const updateMedicalRecordMutation = ({
  id,
  ...data
}: IMedicalRecordForm & { id: string }) => {
  const formData = new FormData();

  formData.append("petId", data.petId);
  formData.append("recordType", data.recordType);
  formData.append("title", data.title);
  formData.append("date", dayjs(data.date).toISOString());

  data.description && formData.append("description", data.description);
  data.vetClinic && formData.append("vetClinic", data.vetClinic);
  data.vetName && formData.append("vetName", data.vetName);

  const attachmentIds = data.attachmentIds
    ?.map((record) => record.id)
    .join(",");
  attachmentIds && formData.append("attachmentIds", attachmentIds);

  data.attachments?.forEach((attachment) => {
    formData.append("attachments", {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
    } as any);
  });

  return APIs.patch<IMedicalRecord>(API_ROUTES.MEDICAL_RECORD_DETAIL(id), {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

export const deleteMedicalRecordMutation = (id: string) =>
  APIs.delete(API_ROUTES.MEDICAL_RECORD_DETAIL(id));

export const addMedicalRecordAttachmentsMutation = ({
  id,
  attachments,
}: {
  id: string;
  attachments: IMedicalRecordForm["attachments"];
}) => {
  const formData = new FormData();

  attachments?.forEach((attachment) => {
    formData.append("attachments", {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
    } as any);
  });

  return APIs.post<IMedicalRecord>(API_ROUTES.MEDICAL_RECORD_ATTACHMENTS(id), {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

export const deleteMedicalRecordAttachmentMutation = ({
  id,
  attachmentId,
}: {
  id: string;
  attachmentId: string;
}) => APIs.delete(API_ROUTES.MEDICAL_RECORD_ATTACHMENT(id, attachmentId));
