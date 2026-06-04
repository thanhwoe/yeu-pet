import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportPhotoDto {
  @IsString()
  @MaxLength(255)
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;
}
