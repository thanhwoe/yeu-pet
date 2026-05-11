export type FileUploadQuality = 'original' | 'downscale';

export interface IFileUploadService {
  uploadImage(
    file: Express.Multer.File,
    folder?: string,
    quality?: FileUploadQuality,
  ): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<boolean>;
  updateImage(payload: {
    file: Express.Multer.File;
    oldPublicId?: string;
    folder?: string;
    quality?: FileUploadQuality;
  }): Promise<UploadResult>;
}

export const IFileUploadService = Symbol('IFileUploadService');

export interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface DestroyResult {
  result: string;
}

export interface UploadJobData {
  files: {
    file: { buffer: Buffer; originalname: string; mimetype: string };
    id?: string | null;
    folder?: string;
    quality?: FileUploadQuality;
  }[];
  itemId: string;
  userId?: string;
}

export interface UploadJobParams {
  jobName: string;
  files: {
    file: Express.Multer.File;
    id?: string | null;
    folder?: string;
    quality?: FileUploadQuality;
  }[];
  itemId: string;
  userId?: string;
}

export interface FileDeleteJobData {
  ids: string[];
}

export interface FileDeleteJobParams {
  jobName: string;
  ids: string[];
}
