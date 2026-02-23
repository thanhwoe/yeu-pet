import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BULLMQ_QUEUES } from '../bullmq/bullmq.queue';
import {
  FileDeleteJobParams,
  UploadJobData,
  UploadJobParams,
} from '@app/interfaces/file-upload.interface';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectQueue(BULLMQ_QUEUES.FILE_UPLOAD) private readonly uploadQueue: Queue,
    @InjectQueue(BULLMQ_QUEUES.FILE_DELETE) private readonly deleteQueue: Queue,
  ) {}

  async addUploadJob({ files, jobName, itemId, userId }: UploadJobParams) {
    const jobData: UploadJobData = {
      files: files.map(({ file, folder, id }) => ({
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        id,
        folder,
      })),
      itemId,
      userId,
    };

    const job = await this.uploadQueue.add(jobName, jobData, {
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return {
      jobId: job.id,
      message: 'Upload queued successfully',
    };
  }

  async addDeleteJob({ ids, jobName }: FileDeleteJobParams) {
    const job = await this.deleteQueue.add(jobName, { ids });
    return {
      jobId: job.id,
      message: 'Delete file queued successfully',
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.uploadQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      jobId: job.id,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      returnvalue: job.returnvalue,
    };
  }
}
