import { API_ROUTES } from "@/constants/api-routes";
import { IPagination, IPhoto } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { ImagePickerAsset } from "expo-image-picker";
import { APIs } from "./api-helper";

export const uploadPhotoMutation = (payload: {
  image: ImagePickerAsset;
  caption: string;
  isPublic: boolean;
}) => {
  const file = {
    uri: payload.image.uri,
    type: payload.image.type,
    name: payload.image?.fileName,
    size: payload.image.fileSize,
  };
  const formData = new FormData();
  formData.append("file", file as any);
  formData.append("caption", payload.caption);
  formData.append("isPublic", payload.isPublic.toString());

  return APIs.post(API_ROUTES.UPLOAD_PHOTO, {
    data: formData,
    headers: { "content-type": "multipart/form-data" },
  });
};

interface IQuery {
  limit: number;
  page: number;
}
export const getListSocialPhotosQuery = ({ limit, page }: IQuery) =>
  APIs.get<{ data: IPhoto[]; metadata: IPagination }>(API_ROUTES.PHOTOS, {
    params: { limit, page },
    paramsSerializer: parseQueryParams,
  });
