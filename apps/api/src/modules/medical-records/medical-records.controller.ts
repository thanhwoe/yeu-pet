import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CreatePetMedicalRecordDto } from './dto/create-pet-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesUploaded } from '@app/decorators/files-uploaded.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { Cacheable, CacheEvict } from '@app/decorators/cache.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';

@Controller()
@UseGuards(PoliciesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('medical-records')
  @CacheEvict()
  @CheckPolicies((ability) => ability.can(Action.Create, 'MedicalRecords'))
  @UseInterceptors(FilesInterceptor('attachments', 5))
  create(
    @CurrentUser() user: accounts,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @FilesUploaded() files?: Express.Multer.File[],
  ) {
    return this.medicalRecordsService.create(
      user,
      createMedicalRecordDto,
      files,
    );
  }

  @Post('pets/:id/medical-records')
  @CacheEvict()
  @CheckPolicies((ability) => ability.can(Action.Create, 'MedicalRecords'))
  @UseInterceptors(FilesInterceptor('attachments', 5))
  createForPet(
    @CurrentUser() user: accounts,
    @IdParam() petId: string,
    @Body() createMedicalRecordDto: CreatePetMedicalRecordDto,
    @FilesUploaded() files?: Express.Multer.File[],
  ) {
    return this.medicalRecordsService.create(
      user,
      {
        ...createMedicalRecordDto,
        petId,
      },
      files,
    );
  }

  @Get('pets/:id/medical-records')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  findAllByPet(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.medicalRecordsService.findAllByPetId(user, id, pagination);
  }

  @Get('medical-records/:id')
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.medicalRecordsService.findOne(user, id);
  }

  @Patch('medical-records/:id')
  @CacheEvict()
  @UseInterceptors(FilesInterceptor('attachments', 5))
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @FilesUploaded() files?: Express.Multer.File[],
  ) {
    return this.medicalRecordsService.update(
      user,
      id,
      updateMedicalRecordDto,
      files,
    );
  }

  @Delete('medical-records/:id')
  @CacheEvict()
  remove(@CurrentUser() user: accounts, @IdParam('id') id: string) {
    return this.medicalRecordsService.remove(user, id);
  }

  @Post('medical-records/:id/attachments')
  @CacheEvict()
  @UseInterceptors(FilesInterceptor('attachments', 5))
  @HttpCode(HttpStatus.ACCEPTED)
  addAttachments(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @FilesUploaded({ required: true }) files: Express.Multer.File[],
  ) {
    return this.medicalRecordsService.addAttachments(user, id, files);
  }

  @Delete('medical-records/:id/attachments/:attachmentId')
  @CacheEvict()
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAttachment(
    @CurrentUser() user: accounts,
    @IdParam('id') id: string,
    @IdParam('attachmentId') attachmentId: string,
  ) {
    return this.medicalRecordsService.removeAttachment(user, id, attachmentId);
  }
}
