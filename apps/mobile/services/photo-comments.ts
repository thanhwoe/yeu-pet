import { API_ROUTES } from "@/constants/api-routes";
import {
  IPhotoComment,
  IPhotoCommentDeleteResult,
  IPhotoCommentForm,
  IPagination,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface IPhotoCommentQuery {
  photoId: string;
  limit?: number;
  page?: number;
}

export const getPhotoCommentsQuery = ({
  photoId,
  ...params
}: IPhotoCommentQuery) =>
  APIs.get<IPagination<IPhotoComment>>(API_ROUTES.PHOTO_COMMENTS(photoId), {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getPhotoCommentRepliesQuery = ({
  photoId,
  commentId,
  ...params
}: IPhotoCommentQuery & { commentId: string }) =>
  APIs.get<IPagination<IPhotoComment>>(
    API_ROUTES.PHOTO_COMMENT_REPLIES(photoId, commentId),
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );

export const createPhotoCommentMutation = ({
  photoId,
  ...params
}: IPhotoCommentForm & { photoId: string }) =>
  APIs.post<IPhotoComment>(API_ROUTES.PHOTO_COMMENTS(photoId), {
    data: params,
  });

export const deletePhotoCommentMutation = ({
  photoId,
  commentId,
}: {
  photoId: string;
  commentId: string;
}) =>
  APIs.delete<IPhotoCommentDeleteResult>(
    API_ROUTES.DELETE_PHOTO_COMMENT(photoId, commentId),
  );
