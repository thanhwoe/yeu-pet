import { Injectable } from '@nestjs/common';
import {
  FileDeleteJobParams,
  UploadJobParams,
} from '@app/interfaces/file-upload.interface';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly queueService: QueueService) {}

  async addUploadJob({ files, jobName, itemId, userId }: UploadJobParams) {
    return this.queueService.dispatchFileUpload({
      files,
      jobName,
      itemId,
      userId,
    });
  }

  async addPhotoJob({ files, jobName, itemId }: UploadJobParams) {
    return this.queueService.dispatchPhotoUpload({
      files,
      jobName,
      itemId,
    });
  }

  async addDeleteJob({ ids, jobName }: FileDeleteJobParams) {
    return this.queueService.dispatchFileDelete({ ids, jobName });
  }

  async getJobStatus(jobId: string) {
    return this.queueService.getFileUploadJobStatus(jobId);
  }
}
