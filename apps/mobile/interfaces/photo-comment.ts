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
}

export interface IPhotoCommentForm {
  content: string;
  parentId?: string;
}
