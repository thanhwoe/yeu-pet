import type {
  DestroyResult,
  FileUploadQuality,
  IFileUploadService,
  UploadResult,
} from '@app/interfaces/file-upload.interface';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService implements IFileUploadService {
  private readonly folder: string;
  private readonly maxFileSize: number;
  private readonly optionMapping: {
    [key: string]: UploadApiOptions;
  };

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });

    this.folder = this.configService.getOrThrow<string>(
      'CLOUDINARY_UPLOAD_FOLDER',
    );

    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE') || '5242880',
    );

    this.optionMapping = {
      original: {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        eager: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }],
        eager_async: false,
        // eager: [
        //   {
        //     width: 500,
        //     height: 500,
        //     crop: 'limit',
        //     quality: 'auto:best',
        //     fetch_format: 'auto',
        //   },
        // ],
      },
      downscale: {
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
    };
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
    quality = 'downscale',
  ): Promise<UploadResult> {
    try {
      // Validate file type
      this.validateImageFile(file);

      const result = await new Promise<UploadApiResponse | undefined>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder || this.folder,
              resource_type: 'image',
              ...this.optionMapping[quality],
            },
            (error, result) => {
              if (error) return reject(new Error(error.message));
              resolve(result);
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      if (!result) {
        throw new BadRequestException('Failed to upload image');
      }

      return {
        url: result.secure_url || result.url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        thumbnailUrl:
          (result.eager as UploadApiResponse[])?.[0]?.secure_url ??
          result.secure_url,
      };
    } catch {
      throw new BadRequestException('Failed to upload image');
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as DestroyResult;

      if (result.result === 'ok' || result.result === 'not found') {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  async updateImage(payload: {
    file: Express.Multer.File;
    oldPublicId?: string;
    folder?: string;
    quality?: FileUploadQuality;
  }): Promise<UploadResult> {
    const { file, folder, oldPublicId, quality } = payload || {};

    const uploadResult = await this.uploadImage(file, folder, quality);

    if (oldPublicId) {
      await this.deleteImage(oldPublicId);
    }

    return uploadResult;
  }

  private validateImageFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`,
      );
    }
  }
}
