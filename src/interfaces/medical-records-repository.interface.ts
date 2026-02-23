import {
  medical_attachments,
  medical_records,
} from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';

export interface IMedicalRecordsRepository extends IBaseRepository<
  medical_records & {
    medical_attachments: medical_attachments[];
  }
> {
  createAttachments(
    params: {
      medical_id: string;
      public_id: string;
      url: string;
    }[],
  ): Promise<BatchPayload>;
  deleteAttachments(ids: string[]): Promise<BatchPayload>;
  findDeletedAttachments(): Promise<medical_attachments[]>;
  destroyAttachments(ids: string[]): Promise<BatchPayload>;
}
