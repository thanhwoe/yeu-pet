import { PartialType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './create-medical-record.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto extends PartialType(
  CreateMedicalRecordDto,
) {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentIds?: string[];
}
