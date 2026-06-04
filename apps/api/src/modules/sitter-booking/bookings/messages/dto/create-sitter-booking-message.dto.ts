import { booking_message_type } from '@app/generated/prisma/enums';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateSitterBookingMessageDto {
  @IsEnum(booking_message_type)
  @IsOptional()
  type?: booking_message_type;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
