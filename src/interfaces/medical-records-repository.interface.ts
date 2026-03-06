import {
  medical_attachments,
  medical_records,
} from '@app/generated/prisma/client';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';

type MedicalRecordDetail = medical_records & {
  medical_attachments: medical_attachments[];
};
export interface IMedicalRecordsRepository {
  createAttachments(
    params: {
      medical_id: string;
      file_id: string;
      url: string;
      thumbnail_url: string;
    }[],
  ): Promise<BatchPayload>;
  deleteAttachments(ids: string[]): Promise<BatchPayload>;
  findDeletedAttachments(): Promise<medical_attachments[]>;
  destroyAttachments(ids: string[]): Promise<BatchPayload>;
  findById(id: string): Promise<MedicalRecordDetail | null>;
  findAll(params?: {
    skip?: number;
    take?: number;
    pet_id: string;
  }): Promise<[medical_records[], number]>;
  create(data: any): Promise<medical_records>;
  update?(id: string, data: any): Promise<medical_records>;
  delete(id: string): Promise<medical_records>;
}
