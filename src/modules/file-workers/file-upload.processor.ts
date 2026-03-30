import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import {
  IFileUploadService,
  UploadJobData,
  UploadResult,
} from '@app/interfaces/file-upload.interface';
import Stream from 'stream';
import { UsersRepository } from '@app/modules/users/users.repository';
import { PetsRepository } from '@app/modules/pets/pets.repository';
import { MedicalRecordsRepository } from '@app/modules/medical-records/medical-records.repository';
import { BULLMQ_QUEUES } from '../shared/bullmq/bullmq.queue';
import { FILE_UPLOAD_JOBS } from './file-workers.job';
import { attachment_status } from '@app/generated/prisma/enums';

@Processor(BULLMQ_QUEUES.FILE_UPLOAD, { concurrency: 4 })
export class FileUploadProcessor extends WorkerHost {
  constructor(
    @Inject(IFileUploadService)
    private readonly fileUploadService: IFileUploadService,
    private readonly usersRepository: UsersRepository,
    private readonly petsRepository: PetsRepository,
    private readonly medicalRecordsRepository: MedicalRecordsRepository,
  ) {
    super();
  }

  async process(
    job: Job<UploadJobData, any, keyof typeof FILE_UPLOAD_JOBS>,
  ): Promise<any> {
    const { files, itemId } = job.data;

    try {
      // Convert buffer back to Multer file format
      const payload = files.map(({ file, folder, id, quality }) => ({
        file: {
          buffer: Buffer.from(file.buffer),
          originalname: file.originalname,
          mimetype: file.mimetype,
          fieldname: 'file',
          encoding: '7bit',
          size: file.buffer.length,
          stream: null as unknown as Stream.Readable,
          destination: '',
          filename: '',
          path: '',
        },
        folder,
        id,
        quality,
      }));

      // Update progress
      await job.updateProgress(30);

      // Upload to Cloudinary
      const results = await Promise.all(
        payload.map((f) =>
          this.fileUploadService.updateImage({
            file: f.file,
            folder: f.folder,
            oldPublicId: f.id || undefined,
            quality: f.quality,
          }),
        ),
      );

      await job.updateProgress(70);

      // Handle specific logic by job name
      switch (job.name) {
        case FILE_UPLOAD_JOBS.USER_AVATAR:
          await this.updateUserAvatar(results[0], itemId);
          break;

        case FILE_UPLOAD_JOBS.PET_AVATAR:
          await this.updatePetAvatar(results[0], itemId);
          break;

        case FILE_UPLOAD_JOBS.MEDICAL_RECORDS:
          await this.addAttachments(results, itemId);
          break;

        default:
          break;
      }

      await job.updateProgress(100);

      return {
        success: true,
      };
    } catch (error) {
      switch (job.name) {
        case FILE_UPLOAD_JOBS.MEDICAL_RECORDS:
          await this.onAttachmentsError(itemId);
          break;

        default:
          break;
      }
      throw error;
    }
  }

  private async updateUserAvatar(data: UploadResult, userId: string) {
    return this.usersRepository.update(userId, {
      avatar_id: data.publicId,
      avatar_url: data.url,
    });
  }

  private async updatePetAvatar(data: UploadResult, petId: string) {
    return this.petsRepository.update(petId, {
      avatar_id: data.publicId,
      avatar_url: data.url,
    });
  }

  private async addAttachments(data: UploadResult[], medicalId: string) {
    const payload = data.map((i) => ({
      medical_id: medicalId,
      file_id: i.publicId,
      url: i.url,
      thumbnail_url: i.thumbnailUrl,
    }));

    return this.medicalRecordsRepository.createAttachments(payload);
  }

  private async onAttachmentsError(id: string) {
    return this.medicalRecordsRepository.update(id, {
      attachment_status: attachment_status.failed,
    });
  }
}
