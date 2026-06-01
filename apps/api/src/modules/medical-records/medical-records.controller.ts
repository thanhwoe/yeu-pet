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
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesUploaded } from '@app/decorators/files-uploaded.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { Cacheable } from '@app/decorators/cache.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';

@Controller()
@UseGuards(PoliciesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('medical-records')
  @CheckPolicies((ability) => ability.can(Action.Create, 'MedicalRecords'))
  @UseInterceptors(FilesInterceptor('attachments', 5))
  create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @FilesUploaded() files?: Express.Multer.File[],
  ) {
    return this.medicalRecordsService.create(createMedicalRecordDto, files);
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
  remove(@CurrentUser() user: accounts, @IdParam('id') id: string) {
    return this.medicalRecordsService.remove(user, id);
  }
}
