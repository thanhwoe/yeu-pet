import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsRepository } from './pets.repository';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { FILE_UPLOAD_JOBS } from '../shared/file-upload/file-upload.jobs';
import dayjs from 'dayjs';

@Injectable()
export class PetsService {
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly fileUploadService: FileUploadService,
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

  async findOne(id: string) {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async update(
    id: string,
    updatePetDto: UpdatePetDto,
    avatarFile?: Express.Multer.File,
  ) {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

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

  async remove(id: string) {
    return this.petsRepository.delete(id);
  }
}
