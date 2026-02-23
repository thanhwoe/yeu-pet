import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { BULLMQ_QUEUES } from '../bullmq/bullmq.queue';
import {
  FileDeleteJobData,
  IFileUploadService,
} from '@app/interfaces/file-upload.interface';
import { MedicalRecordsRepository } from '@app/modules/medical-records/medical-records.repository';
import { FILE_DELETE_JOBS } from './file-delete.jobs';

@Processor(BULLMQ_QUEUES.FILE_DELETE, { concurrency: 3 })
export class FileDeleteProcessor extends WorkerHost {
  constructor(
    @Inject(IFileUploadService)
    private readonly fileUploadService: IFileUploadService,
    private readonly medicalRecordsRepository: MedicalRecordsRepository,
  ) {
    super();
  }

  async process(
    job: Job<FileDeleteJobData, any, keyof typeof FILE_DELETE_JOBS>,
  ): Promise<any> {
    const { ids } = job.data;

    // Update progress
    await job.updateProgress(30);

    await Promise.all(ids.map((i) => this.fileUploadService.deleteImage(i)));

    await job.updateProgress(70);

    // Handle specific logic by job name
    switch (job.name) {
      case FILE_DELETE_JOBS.MEDICAL_RECORDS:
        await this.medicalRecordsRepository.destroyAttachments(ids);
        break;

      default:
        break;
    }

    await job.updateProgress(100);

    return {
      success: true,
    };
  }
}
