import { report_target_type } from '@app/generated/prisma/enums';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  @IsEnum(report_target_type)
  targetType: report_target_type;

  @IsUUID()
  targetId: string;

  @IsString()
  @MaxLength(255)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
