import { IsOptional, IsString } from 'class-validator';

export class CancelSitterBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
