import {
  EMAIL_JOBS,
  EmailJobParams,
} from '@app/interfaces/email-jobs.interface';
import {
  FileDeleteJobData,
  FileDeleteJobParams,
  UploadJobData,
  UploadJobParams,
} from '@app/interfaces/file-upload.interface';
import { OtpJobData, SendOtpJobParams } from '@app/interfaces/otp.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { BULLMQ_QUEUES } from '../bullmq/bullmq.queue';

export interface QueuedJobResult {
  jobId: string | undefined;
  message: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(BULLMQ_QUEUES.FILE_UPLOAD)
    private readonly fileUploadQueue: Queue<UploadJobData>,
    @InjectQueue(BULLMQ_QUEUES.FILE_DELETE)
    private readonly fileDeleteQueue: Queue<FileDeleteJobData>,
    @InjectQueue(BULLMQ_QUEUES.PHOTO_UPLOAD)
    private readonly photoUploadQueue: Queue<UploadJobData>,
    @InjectQueue(BULLMQ_QUEUES.SEND_OTP)
    private readonly otpQueue: Queue<OtpJobData>,
    @InjectQueue(BULLMQ_QUEUES.EMAIL)
    private readonly emailQueue: Queue<EmailJobParams>,
  ) {}

  async dispatchFileUpload(params: UploadJobParams): Promise<QueuedJobResult> {
    const job = await this.fileUploadQueue.add(
      params.jobName,
      this.toUploadJobData(params),
      this.defaultBackoff(),
    );

    return this.toResult(job, 'Upload queued successfully');
  }

  async dispatchPhotoUpload(params: UploadJobParams): Promise<QueuedJobResult> {
    const job = await this.photoUploadQueue.add(
      params.jobName,
      this.toUploadJobData(params),
      this.defaultBackoff(),
    );

    return this.toResult(job, 'Photo queued successfully');
  }

  async dispatchFileDelete(
    params: FileDeleteJobParams,
  ): Promise<QueuedJobResult> {
    const job = await this.fileDeleteQueue.add(params.jobName, {
      ids: params.ids,
    });

    return this.toResult(job, 'Delete file queued successfully');
  }

  async dispatchOtp(params: SendOtpJobParams): Promise<QueuedJobResult> {
    const { jobName, ...jobData } = params;
    const job = await this.otpQueue.add(jobName, jobData);

    return this.toResult(job, 'Send OTP queued successfully');
  }

  async dispatchEmail(params: EmailJobParams): Promise<QueuedJobResult> {
    const { jobName = EMAIL_JOBS.SEND_EMAIL, ...jobData } = params;
    const job = await this.emailQueue.add(jobName, jobData);

    return this.toResult(job, 'Email queued successfully');
  }

  async getFileUploadJobStatus(jobId: string) {
    const job = await this.fileUploadQueue.getJob(jobId);

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

  private toUploadJobData(params: UploadJobParams): UploadJobData {
    return {
      files: params.files.map(({ file, folder, id, quality }) => ({
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        id,
        folder,
        quality,
      })),
      itemId: params.itemId,
      userId: params.userId,
    };
  }

  private defaultBackoff() {
    return {
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };
  }

  private toResult(job: Job, message: string): QueuedJobResult {
    return {
      jobId: job.id,
      message,
    };
  }
}
