import { IsAfterField, IsAfterNow } from '@app/decorators/is-after.decorator';
import { sitter_bookings_type } from '@app/generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSitterBookingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  idempotencyKey: string;

  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsEnum(sitter_bookings_type)
  @IsNotEmpty()
  type: sitter_bookings_type;

  @IsUUID()
  @IsNotEmpty()
  sitterId: string;

  @IsDateString()
  @IsNotEmpty()
  @IsAfterNow()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @IsAfterField('startTime')
  endTime: string;
}
