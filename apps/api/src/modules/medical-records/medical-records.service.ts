import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import dayjs from 'dayjs';
import { accounts, attachment_status } from '@app/generated/prisma/client';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @Inject(IMedicalRecordsRepository)
    private readonly medicalRecordsRepository: IMedicalRecordsRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly subscriptionService: SubscriptionService,
  ) {}
  async create(
    user: accounts,
    createMedicalRecordDto: CreateMedicalRecordDto,
    files?: Express.Multer.File[],
  ) {
    await this.assertPetOwner(user, createMedicalRecordDto.petId);
    await this.subscriptionService.assertCanCreateMedicalRecord(user.id);
    await this.subscriptionService.assertCanUploadMedicalImages(
      user.id,
      files?.length ?? 0,
    );

    const medical = await this.medicalRecordsRepository.create({
      date: createMedicalRecordDto.date
        ? dayjs(createMedicalRecordDto.date).toDate()
        : null,
      description: createMedicalRecordDto.description,
      pet_id: createMedicalRecordDto.petId,
      record_type: createMedicalRecordDto.recordType,
      title: createMedicalRecordDto.title,
      vet_clinic: createMedicalRecordDto.vetClinic,
      vet_name: createMedicalRecordDto.vetName,
      attachment_status: attachment_status.processing,
    });

    if (files && files.length > 0) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.MEDICAL_RECORDS,
        files: files.map((f) => ({
          file: f,
          folder: `pets/${medical.pet_id}/medical/${medical.id}`,
          quality: 'original',
        })),
        itemId: medical.id,
      });
    }

    return medical;
  }

  async findAllByPetId(
    user: accounts,
    pet_id: string,
    pagination: PaginationDto,
  ) {
    const pet = await this.petsRepository.findById(pet_id);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${pet_id} not found`);
    }

    assertOwnerOrAdmin(user, pet.account_id);

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.medicalRecordsRepository.findAll({
      skip,
      take: limit,
      pet_id,
    });

    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const medical = await this.assertMedicalRecordOwner(user, id);

    return medical;
  }

  async update(
    user: accounts,
    id: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    files?: Express.Multer.File[],
  ) {
    const medical = await this.assertMedicalRecordOwner(user, id);
    if (updateMedicalRecordDto.petId) {
      await this.assertPetOwner(user, updateMedicalRecordDto.petId);
    }

    const keepIds =
      updateMedicalRecordDto.attachmentIds ??
      medical.medical_attachments.map((i) => i.id);

    const totalAttachmentsKept = medical.medical_attachments.filter((i) =>
      keepIds.includes(i.id),
    ).length;

    await this.subscriptionService.assertCanUploadMedicalImages(
      user.id,
      totalAttachmentsKept + (files?.length ?? 0),
    );

    const attachmentRemovedIds = medical.medical_attachments
      .filter((i) => !keepIds.includes(i.id))
      .map((i) => i.id);

    if (attachmentRemovedIds.length > 0) {
      await this.medicalRecordsRepository.deleteAttachments(
        attachmentRemovedIds,
      );
    }

    if (files && files.length > 0) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.MEDICAL_RECORDS,
        files: files.map((f) => ({
          file: f,
          folder: `pets/${medical.pet_id}/medical/${medical.id}`,
          quality: 'original',
        })),
        itemId: medical.id,
      });
    }

    return this.medicalRecordsRepository.update(id, {
      pets: updateMedicalRecordDto.petId
        ? {
            connect: {
              id: updateMedicalRecordDto.petId,
            },
          }
        : undefined,
      date: updateMedicalRecordDto.date
        ? dayjs(updateMedicalRecordDto.date).toDate()
        : undefined,
      description: updateMedicalRecordDto.description,
      record_type: updateMedicalRecordDto.recordType,
      title: updateMedicalRecordDto.title,
      vet_clinic: updateMedicalRecordDto.vetClinic,
      vet_name: updateMedicalRecordDto.vetName,
    });
  }

  async remove(user: accounts, id: string) {
    const medical = await this.assertMedicalRecordOwner(user, id);

    if (medical.medical_attachments.length > 0) {
      const fileIds = medical.medical_attachments
        .map((f) => f.file_id)
        .filter((id): id is string => !!id);

      await this.fileUploadService.addDeleteJob({
        ids: fileIds,
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      });
    }

    return this.medicalRecordsRepository.delete(id);
  }

  async addAttachments(
    user: accounts,
    id: string,
    files: Express.Multer.File[],
  ) {
    const medical = await this.assertMedicalRecordOwner(user, id);
    const totalAttachments =
      medical.medical_attachments.length + (files?.length ?? 0);

    await this.subscriptionService.assertCanUploadMedicalImages(
      user.id,
      totalAttachments,
    );

    if (files.length > 0) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.MEDICAL_RECORDS,
        files: files.map((f) => ({
          file: f,
          folder: `pets/${medical.pet_id}/medical/${medical.id}`,
          quality: 'original',
        })),
        itemId: medical.id,
      });
    }

    return this.medicalRecordsRepository.update(id, {
      attachment_status: attachment_status.processing,
    });
  }

  async removeAttachment(user: accounts, id: string, attachmentId: string) {
    const medical = await this.assertMedicalRecordOwner(user, id);
    const attachment = medical.medical_attachments.find(
      (item) => item.id === attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException('Medical attachment not found');
    }

    await this.medicalRecordsRepository.deleteAttachments([attachmentId]);

    if (attachment.file_id) {
      await this.fileUploadService.addDeleteJob({
        ids: [attachment.file_id],
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      });
    }
  }

  async destroyDeletedAttachments() {
    const attachments =
      await this.medicalRecordsRepository.findDeletedAttachments();

    if (attachments.length > 0) {
      const fileIds = attachments
        .map((f) => f.file_id)
        .filter((id): id is string => !!id);

      await this.fileUploadService.addDeleteJob({
        ids: fileIds,
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      });
    }
  }

  private async assertMedicalRecordOwner(user: accounts, recordId: string) {
    const record = await this.medicalRecordsRepository.findById(recordId);
    if (!record)
      throw new NotFoundException(
        `Medical record with ID ${recordId} not found`,
      );

    const pet = await this.petsRepository.findById(record.pet_id);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${record.pet_id} not found`);
    }

    assertOwnerOrAdmin(user, pet.account_id);

    return record;
  }

  private async assertPetOwner(user: accounts, petId: string) {
    const pet = await this.petsRepository.findById(petId);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    assertOwnerOrAdmin(user, pet.account_id);

    return pet;
  }
}
