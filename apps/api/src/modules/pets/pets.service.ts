import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import dayjs from 'dayjs';
import { accounts } from '@app/generated/prisma/client';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PetsService {
  constructor(
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly subscriptionService: SubscriptionService,
  ) {}
  async create(
    userId: string,
    createPetDto: CreatePetDto,
    avatarFile?: Express.Multer.File,
  ) {
    await this.subscriptionService.assertCanCreatePet(userId);

    const pet = await this.petsRepository.create({
      name: createPetDto.name,
      account_id: userId,
      age: createPetDto.age,
      birthdate: createPetDto.birthdate
        ? dayjs(createPetDto.birthdate).toDate()
        : null,
      breed: createPetDto.breed,
      color: createPetDto.color,
      gender: createPetDto.gender,
      notes: createPetDto.notes,
      species: createPetDto.species,
      weight: createPetDto.weight,
      weight_value: createPetDto.weightValue,
      weight_unit: createPetDto.weightUnit,
    });

    if (avatarFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.PET_AVATAR,
        files: [
          {
            file: avatarFile,
            folder: `pets/${pet.id}`,
          },
        ],
        itemId: pet.id,
        userId,
      });
    }
    return pet;
  }

  async findAllByUserId(account_id: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.petsRepository.findAll({
      account_id,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const pet = await this.assertPetOwner(user, id);

    return pet;
  }

  async update(
    user: accounts,
    id: string,
    updatePetDto: UpdatePetDto,
    avatarFile?: Express.Multer.File,
  ) {
    const pet = await this.assertPetOwner(user, id);
    const shouldClearWeightMeta = updatePetDto.weight === '';

    if (avatarFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.PET_AVATAR,
        files: [
          {
            file: avatarFile,
            id: pet.avatar_id,
            folder: `pets/${pet.id}`,
          },
        ],
        itemId: pet.id,
      });
    }

    return this.petsRepository.update(id, {
      name: updatePetDto.name,
      age: updatePetDto.age,
      birthdate: updatePetDto.birthdate
        ? dayjs(updatePetDto.birthdate).toDate()
        : undefined,
      breed: updatePetDto.breed,
      color: updatePetDto.color,
      gender: updatePetDto.gender,
      notes: updatePetDto.notes,
      species: updatePetDto.species,
      weight: updatePetDto.weight,
      weight_value: shouldClearWeightMeta ? null : updatePetDto.weightValue,
      weight_unit: shouldClearWeightMeta ? null : updatePetDto.weightUnit,
    });
  }

  async remove(user: accounts, id: string) {
    const pet = await this.assertPetOwner(user, id);

    if (pet.avatar_id) {
      await this.fileUploadService.addDeleteJob({
        ids: [pet.avatar_id],
        jobName: FILE_DELETE_JOBS.PET_AVATAR,
      });
    }

    await this.petsRepository.delete(id);
  }

  private async assertPetOwner(user: accounts, petId: string) {
    const pet = await this.petsRepository.findById(petId);

    if (!pet) throw new NotFoundException(`Pet with ID ${petId} not found`);

    assertOwnerOrAdmin(user, pet.account_id);

    return pet;
  }
}
