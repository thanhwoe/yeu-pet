import { PartialType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './create-medical-record.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMedicalRecordDto extends PartialType(
  CreateMedicalRecordDto,
) {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentIds?: string[];
}
