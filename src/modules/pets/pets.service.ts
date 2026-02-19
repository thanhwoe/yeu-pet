import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsRepository } from './pets.repository';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { FILE_UPLOAD_JOBS } from '../shared/file-upload/file-upload.jobs';
import dayjs from 'dayjs';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { accounts } from '@app/generated/prisma/client';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';

@Injectable()
export class PetsService {
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async create(
    userId: string,
    createPetDto: CreatePetDto,
    avatarFile?: Express.Multer.File,
  ) {
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
    });

    if (avatarFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.PET_AVATAR,
        file: avatarFile,
        itemId: pet.id,
        options: {
          userId,
          folder: `pets/${pet.id}`,
        },
      });
    }
    return pet;
  }

  async findAllByUserId(account_id: string) {
    return this.petsRepository.findAll({ account_id });
  }

  async findOne(user: accounts, id: string) {
    const pet = await this.assertPetAbility(user, id, Action.Read);

    return pet;
  }

  async update(
    user: accounts,
    id: string,
    updatePetDto: UpdatePetDto,
    avatarFile?: Express.Multer.File,
  ) {
    const pet = await this.assertPetAbility(user, id, Action.Update);

    if (avatarFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.PET_AVATAR,
        file: avatarFile,
        itemId: pet.id,
        options: {
          folder: `pets/${pet.id}`,
          oldFileId: pet.avatar_id || undefined,
        },
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
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertPetAbility(user, id, Action.Delete);

    return this.petsRepository.delete(id);
  }

  private async assertPetAbility(
    user: accounts,
    petId: string,
    action: Action,
  ) {
    const pet = await this.petsRepository.findById(petId);

    if (!pet) throw new NotFoundException(`Pet with ID ${petId} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'Pets', pet);

    return pet;
  }
}
