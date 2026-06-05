import { attachment_status, record_type } from '@app/generated/prisma/client';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { Test } from '@nestjs/testing';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { MedicalRecordsService } from './medical-records.service';

describe('MedicalRecordsService', () => {
  const medicalRecordsRepository = {
    create: jest.fn(),
    deleteAttachments: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
  const petsRepository = {
    findById: jest.fn(),
  };
  const fileUploadService = {
    addUploadJob: jest.fn(),
    addDeleteJob: jest.fn(),
  };
  const subscriptionService = {
    assertCanCreateMedicalRecord: jest.fn(),
    assertCanUploadMedicalImages: jest.fn(),
  };

  let service: MedicalRecordsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        {
          provide: IMedicalRecordsRepository,
          useValue: medicalRecordsRepository,
        },
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: FileUploadService, useValue: fileUploadService },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compile();

    service = moduleRef.get(MedicalRecordsService);
  });

  it('checks pet ownership and entitlements before creating records', async () => {
    petsRepository.findById.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    medicalRecordsRepository.create.mockResolvedValue({
      id: 'record-1',
      pet_id: 'pet-1',
    });

    await service.create(
      {
        id: 'account-1',
      } as never,
      {
        petId: 'pet-1',
        title: 'Rabies vaccine',
        recordType: record_type.vaccination,
      } as never,
      [{ originalname: 'vaccine.png' }] as Express.Multer.File[],
    );

    expect(
      subscriptionService.assertCanCreateMedicalRecord,
    ).toHaveBeenCalledWith('account-1');
    expect(
      subscriptionService.assertCanUploadMedicalImages,
    ).toHaveBeenCalledWith('account-1', 1);
    expect(medicalRecordsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        pet_id: 'pet-1',
        attachment_status: attachment_status.processing,
      }),
    );
    expect(fileUploadService.addUploadJob).toHaveBeenCalled();
  });

  it('checks image limit against kept and newly added attachments on update', async () => {
    medicalRecordsRepository.findById.mockResolvedValue({
      id: 'record-1',
      pet_id: 'pet-1',
      medical_attachments: [{ id: 'attachment-1' }, { id: 'attachment-2' }],
    });
    medicalRecordsRepository.deleteAttachments.mockResolvedValue({ count: 1 });
    petsRepository.findById.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    medicalRecordsRepository.update.mockResolvedValue({ id: 'record-1' });

    await service.update(
      {
        id: 'account-1',
      } as never,
      'record-1',
      {
        attachmentIds: ['attachment-1'],
      },
      [{ originalname: 'new.png' }] as Express.Multer.File[],
    );

    expect(
      subscriptionService.assertCanUploadMedicalImages,
    ).toHaveBeenCalledWith('account-1', 2);
    expect(medicalRecordsRepository.deleteAttachments).toHaveBeenCalledWith([
      'attachment-2',
    ]);
  });

  it('adds attachments through the dedicated attachment route flow', async () => {
    medicalRecordsRepository.findById.mockResolvedValue({
      id: 'record-1',
      pet_id: 'pet-1',
      medical_attachments: [{ id: 'attachment-1' }],
    });
    petsRepository.findById.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    medicalRecordsRepository.update.mockResolvedValue({ id: 'record-1' });

    await service.addAttachments({ id: 'account-1' } as never, 'record-1', [
      { originalname: 'new.png' },
    ] as Express.Multer.File[]);

    expect(
      subscriptionService.assertCanUploadMedicalImages,
    ).toHaveBeenCalledWith('account-1', 2);
    expect(fileUploadService.addUploadJob).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'record-1',
      }),
    );
  });

  it('soft-deletes a single attachment and queues file deletion', async () => {
    medicalRecordsRepository.findById.mockResolvedValue({
      id: 'record-1',
      pet_id: 'pet-1',
      medical_attachments: [
        { id: 'attachment-1', file_id: 'file-1' },
        { id: 'attachment-2', file_id: 'file-2' },
      ],
    });
    petsRepository.findById.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    medicalRecordsRepository.deleteAttachments.mockResolvedValue({ count: 1 });

    await service.removeAttachment(
      { id: 'account-1' } as never,
      'record-1',
      'attachment-1',
    );

    expect(medicalRecordsRepository.deleteAttachments).toHaveBeenCalledWith([
      'attachment-1',
    ]);
    expect(fileUploadService.addDeleteJob).toHaveBeenCalledWith({
      ids: ['file-1'],
      jobName: 'medical-records',
    });
  });
});
