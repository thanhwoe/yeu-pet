import { record_type } from '@app/generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(record_type)
  recordType: record_type;

  @IsOptional()
  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  vetClinic: string;

  @IsString()
  @IsOptional()
  vetName: string;
}
