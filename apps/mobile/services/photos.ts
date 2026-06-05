import { API_ROUTES } from "@/constants/api-routes";
import { IPagination, IPhoto } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { ImagePickerAsset } from "expo-image-picker";
import { APIs } from "./api-helper";

export const uploadPhotoMutation = (payload: {
  image: ImagePickerAsset;
  caption: string;
  isPrivate: boolean;
}) => {
  const fallbackFileName = payload.image.uri.split("/").pop() || "photo.jpg";
  const file = {
    uri: payload.image.uri,
    type: payload.image.mimeType ?? "image/jpeg",
    name: payload.image.fileName ?? fallbackFileName,
    size: payload.image.fileSize,
  };

  const formData = new FormData();
  formData.append("file", file as any);
  formData.append("caption", payload.caption.trim());
  formData.append("isPrivate", String(payload.isPrivate));

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
  APIs.get<IPagination<IPhoto>>(API_ROUTES.PHOTOS, {
    params: { limit, page },
    paramsSerializer: parseQueryParams,
  });

export const getListUserPhotosQuery = ({ limit, page }: IQuery) =>
  APIs.get<IPagination<IPhoto>>(API_ROUTES.USER_PHOTOS, {
    params: { limit, page },
    paramsSerializer: parseQueryParams,
  });

export const toggleLikePhotoMutation = ({ id }: { id: string }) =>
  APIs.post<IPhoto>(API_ROUTES.LIKE_PHOTO(id));

export const unlikePhotoMutation = ({ id }: { id: string }) =>
  APIs.delete<IPhoto>(API_ROUTES.LIKE_PHOTO(id));

export const getPhotoStatsQuery = ({ id }: { id: string }) =>
  APIs.get<IPhoto>(API_ROUTES.PHOTO_STATS(id));

export const deletePhotoMutation = ({ id }: { id: string }) =>
  APIs.delete<{ data: IPhoto }>(API_ROUTES.DELETE_PHOTO(id));
