export interface IFileUploadService {
  uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<boolean>;
  updateImage(
    file: Express.Multer.File,
    oldPublicId?: string,
    folder?: string,
  ): Promise<UploadResult>;
}

export const IFileUploadService = Symbol('IFileUploadService');

export interface UploadResult {
  url: string;
  publicId: string;
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
