import { IPhoto } from "./photos";

export interface IPhotoComment {
  id: string;
  accountId: string;
  photoId: string;
  parentId: string | null;
  content: string;
  deletedAt: string | null;
  replyCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  accounts: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface IPhotoCommentForm {
  content: string;
  parentId?: string;
}

export interface IPhotoCommentDeleteResult {
  comment: IPhotoComment;
  photo: IPhoto;
  replyCount?: number;
}
