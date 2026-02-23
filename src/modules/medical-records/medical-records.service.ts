import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordsRepository } from './medical-records.repository';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { FILE_UPLOAD_JOBS } from '../shared/file-upload/file-upload.jobs';
import dayjs from 'dayjs';
import { FILE_DELETE_JOBS } from '../shared/file-upload/file-delete.jobs';
import { Action } from '../casl/casl.types';
import { accounts } from '@app/generated/prisma/client';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PetsRepository } from '../pets/pets.repository';
import { assertAbility } from '../casl/casl.helper';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly medicalRecordsRepository: MedicalRecordsRepository,
    private readonly petsRepository: PetsRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async create(
    createMedicalRecordDto: CreateMedicalRecordDto,
    files?: Express.Multer.File[],
  ) {
    const medical = await this.medicalRecordsRepository.create({
      date: dayjs(createMedicalRecordDto.date).toDate(),
      description: createMedicalRecordDto.description,
      pet_id: createMedicalRecordDto.petId,
      record_type: createMedicalRecordDto.recordType,
      title: createMedicalRecordDto.title,
      vet_clinic: createMedicalRecordDto.vetClinic,
      vet_name: createMedicalRecordDto.vetName,
    });

    if (files && files.length > 0) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.MEDICAL_RECORDS,
        files: files.map((f) => ({
          file: f,
          folder: `pets/${medical.pet_id}/medical/${medical.id}`,
        })),
        itemId: medical.id,
      });
    }

    return medical;
  }

  async findAllByPetId(user: accounts, pet_id: string) {
    const pet = await this.petsRepository.findById(pet_id);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${pet_id} not found`);
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, Action.Read, 'Pets', pet);

    return this.medicalRecordsRepository.findAll({ pet_id });
  }

  async findOne(user: accounts, id: string) {
    const medical = await this.assertMedicalRecordAbility(
      user,
      id,
      Action.Read,
    );

    return medical;
  }

  async update(
    user: accounts,
    id: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    files?: Express.Multer.File[],
  ) {
    const medical = await this.assertMedicalRecordAbility(
      user,
      id,
      Action.Update,
    );

    const keepIds =
      updateMedicalRecordDto.attachmentIds ??
      medical.medical_attachments.map((i) => i.id);

    const totalAttachmentsKept = medical.medical_attachments.filter((i) =>
      keepIds.includes(i.id),
    ).length;

    if (totalAttachmentsKept + (files?.length ?? 0) > 5) {
      throw new BadRequestException(
        `Maximum 5 attachments allowed. You currently have ${totalAttachmentsKept} and are adding ${files?.length ?? 0}.`,
      );
    }

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
        })),
        itemId: medical.id,
      });
    }

    return this.medicalRecordsRepository.update(id, {
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
    const medical = await this.assertMedicalRecordAbility(
      user,
      id,
      Action.Delete,
    );

    if (medical.medical_attachments.length > 0) {
      const fileIds = medical.medical_attachments
        .map((f) => f.public_id)
        .filter((id): id is string => !!id);

      await this.fileUploadService.addDeleteJob({
        ids: fileIds,
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      });
    }

    return this.medicalRecordsRepository.delete(id);
  }

  async destroyDeletedAttachments() {
    const attachments =
      await this.medicalRecordsRepository.findDeletedAttachments();

    if (attachments.length > 0) {
      const fileIds = attachments
        .map((f) => f.public_id)
        .filter((id): id is string => !!id);

      await this.fileUploadService.addDeleteJob({
        ids: fileIds,
        jobName: FILE_DELETE_JOBS.MEDICAL_RECORDS,
      });
    }
  }

  private async assertMedicalRecordAbility(
    user: accounts,
    recordId: string,
    action: Action,
  ) {
    const record = await this.medicalRecordsRepository.findById(recordId);
    if (!record)
      throw new NotFoundException(
        `Medical record with ID ${recordId} not found`,
      );

    const pet = await this.petsRepository.findById(record.pet_id);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${record.pet_id} not found`);
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, Action.Read, 'Pets', pet);

    assertAbility(ability, action, 'MedicalRecords', record);

    return record;
  }
}
