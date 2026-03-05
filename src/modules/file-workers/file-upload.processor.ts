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
import { BudgetCategoriesRepository } from '@app/modules/budget-categories/budget-categories.repository';
import { BULLMQ_QUEUES } from '../shared/bullmq/bullmq.queue';
import { FILE_UPLOAD_JOBS } from './file-workers.job';

@Processor(BULLMQ_QUEUES.FILE_UPLOAD, { concurrency: 4 })
export class FileUploadProcessor extends WorkerHost {
  constructor(
    @Inject(IFileUploadService)
    private readonly fileUploadService: IFileUploadService,
    private readonly usersRepository: UsersRepository,
    private readonly petsRepository: PetsRepository,
    private readonly medicalRecordsRepository: MedicalRecordsRepository,
    private readonly budgetCategoriesRepository: BudgetCategoriesRepository,
  ) {
    super();
  }

  async process(
    job: Job<UploadJobData, any, keyof typeof FILE_UPLOAD_JOBS>,
  ): Promise<any> {
    const { files, itemId } = job.data;

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

      case FILE_UPLOAD_JOBS.BUDGET_CATEGORIES:
        await this.updateBudgetCategoryImage(results[0], itemId);
        break;

      default:
        break;
    }

    await job.updateProgress(100);

    return {
      success: true,
    };
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
  private async updateBudgetCategoryImage(data: UploadResult, id: string) {
    return this.budgetCategoriesRepository.update(id, {
      image_id: data.publicId,
      image_url: data.url,
    });
  }

  private async addAttachments(data: UploadResult[], medicalId: string) {
    const payload = data.map((i) => ({
      medical_id: medicalId,
      public_id: i.publicId,
      url: i.url,
    }));

    return this.medicalRecordsRepository.createAttachments(payload);
  }
}
