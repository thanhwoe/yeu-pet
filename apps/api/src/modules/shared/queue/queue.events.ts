import type {
  FileDeleteJobParams,
  UploadJobParams,
} from '@app/interfaces/file-upload.interface';
import type { SendOtpJobParams } from '@app/interfaces/otp.interface';
import type { EmailJobParams } from '@app/interfaces/email-jobs.interface';

export const QUEUE_EVENT_CHANNELS = {
  FILE_UPLOAD_REQUESTED: 'queue.file-upload.requested',
  PHOTO_UPLOAD_REQUESTED: 'queue.photo-upload.requested',
  FILE_DELETE_REQUESTED: 'queue.file-delete.requested',
  OTP_REQUESTED: 'queue.otp.requested',
  EMAIL_REQUESTED: 'queue.email.requested',
} as const;

export type QueueDispatchEvent =
  | {
      channel: typeof QUEUE_EVENT_CHANNELS.FILE_UPLOAD_REQUESTED;
      payload: UploadJobParams;
    }
  | {
      channel: typeof QUEUE_EVENT_CHANNELS.PHOTO_UPLOAD_REQUESTED;
      payload: UploadJobParams;
    }
  | {
      channel: typeof QUEUE_EVENT_CHANNELS.FILE_DELETE_REQUESTED;
      payload: FileDeleteJobParams;
    }
  | {
      channel: typeof QUEUE_EVENT_CHANNELS.OTP_REQUESTED;
      payload: SendOtpJobParams;
    }
  | {
      channel: typeof QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED;
      payload: EmailJobParams;
    };
