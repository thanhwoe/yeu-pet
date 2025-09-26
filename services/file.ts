import { API_ROUTES } from "@/constants/api-routes";
import { UploadFileResponse } from "@/interfaces";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { APIs } from "./api-helper";

export const uploadFileMutation = (
  payload: ImagePickerAsset | DocumentPickerAsset
) => {
  const asset = payload as ImagePickerAsset & DocumentPickerAsset;
  const file = {
    uri: asset.uri,
    type: asset.type,
    name: asset?.fileName || asset?.name,
    size: asset.fileSize || asset.size,
  };
  const formData = new FormData();
  formData.append("file", file as any);

  return APIs.post<UploadFileResponse>(API_ROUTES.UPLOAD_FILE, {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};
