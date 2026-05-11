import { photos_status } from '@app/generated/prisma/enums';

export const photoChannel = (photoId: string) => `photos:upload:${photoId}`;
export const photoLastMessage = (photoId: string) =>
  `photos:lastMessage:${photoId}`;

export interface UploadEvent {
  type: photos_status;
  id: string;
  progress?: number;
}
