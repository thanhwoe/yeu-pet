import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { Cacheable, CacheEvict } from '@app/decorators/cache.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';

@Controller('pets')
@UseGuards(PoliciesGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Post()
  @CacheEvict()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Pets'))
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createPetDto: CreatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.create(user.id, createPetDto, avatar);
  }

  @Get()
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.petsService.findAllByUserId(user.id, pagination);
  }

  @Get(':id')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.petsService.findOne(user, id);
  }

  @Get(':id/medical-records')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  findAllMedicalRecords(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.medicalRecordsService.findAllByPetId(user, id, pagination);
  }

  @Patch(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updatePetDto: UpdatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.update(user, id, updatePetDto, avatar);
  }

  @Delete(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.petsService.remove(user, id);
  }
}
