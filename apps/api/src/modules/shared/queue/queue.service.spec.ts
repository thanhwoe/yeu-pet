import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '@app/modules/file-workers/file-workers.job';
import { OTP_JOBS } from '../otp/otp.job';
import { QueueService } from './queue.service';

const createQueue = () => ({
  add: jest.fn((name: string) => Promise.resolve({ id: `${name}-job-id` })),
  getJob: jest.fn(),
});

const createFile = (): Express.Multer.File =>
  ({
    buffer: Buffer.from('file'),
    originalname: 'avatar.png',
    mimetype: 'image/png',
  }) as Express.Multer.File;

describe('QueueService', () => {
  let fileUploadQueue: ReturnType<typeof createQueue>;
  let fileDeleteQueue: ReturnType<typeof createQueue>;
  let photoUploadQueue: ReturnType<typeof createQueue>;
  let otpQueue: ReturnType<typeof createQueue>;
  let emailQueue: ReturnType<typeof createQueue>;
  let service: QueueService;

  beforeEach(() => {
    fileUploadQueue = createQueue();
    fileDeleteQueue = createQueue();
    photoUploadQueue = createQueue();
    otpQueue = createQueue();
    emailQueue = createQueue();
    service = new QueueService(
      fileUploadQueue as never,
      fileDeleteQueue as never,
      photoUploadQueue as never,
      otpQueue as never,
      emailQueue as never,
    );
  });

  it('dispatches typed file upload jobs', async () => {
    const result = await service.dispatchFileUpload({
      jobName: FILE_UPLOAD_JOBS.USER_AVATAR,
      itemId: 'user-1',
      userId: 'user-1',
      files: [{ file: createFile(), folder: 'users/user-1' }],
    });

    expect(result).toEqual({
      jobId: `${FILE_UPLOAD_JOBS.USER_AVATAR}-job-id`,
      message: 'Upload queued successfully',
    });
    expect(fileUploadQueue.add.mock.calls).toEqual([
      [
        FILE_UPLOAD_JOBS.USER_AVATAR,
        {
          itemId: 'user-1',
          userId: 'user-1',
          files: [
            {
              file: {
                buffer: Buffer.from('file'),
                originalname: 'avatar.png',
                mimetype: 'image/png',
              },
              folder: 'users/user-1',
              id: undefined,
              quality: undefined,
            },
          ],
        },
        {
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      ],
    ]);
  });

  it('dispatches typed file delete and OTP jobs', async () => {
    await service.dispatchFileDelete({
      jobName: FILE_DELETE_JOBS.USER_AVATAR,
      ids: ['file-1'],
    });
    await service.dispatchOtp({
      jobName: OTP_JOBS.SEND_OTP_EMAIL,
      email: 'user@example.com',
      token: '123456',
      userName: 'User',
    });

    expect(fileDeleteQueue.add.mock.calls).toEqual([
      [FILE_DELETE_JOBS.USER_AVATAR, { ids: ['file-1'] }],
    ]);
    expect(otpQueue.add.mock.calls).toEqual([
      [
        OTP_JOBS.SEND_OTP_EMAIL,
        {
          email: 'user@example.com',
          token: '123456',
          userName: 'User',
        },
      ],
    ]);
  });

  it('dispatches email jobs with the default job name', async () => {
    const result = await service.dispatchEmail({
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Hello',
    });

    expect(result).toEqual({
      jobId: 'send-email-job-id',
      message: 'Email queued successfully',
    });
    expect(emailQueue.add.mock.calls).toEqual([
      [
        'send-email',
        {
          to: 'user@example.com',
          subject: 'Welcome',
          text: 'Hello',
        },
      ],
    ]);
  });
});
