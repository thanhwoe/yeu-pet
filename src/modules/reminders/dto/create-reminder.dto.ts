import { reminder_status, reminder_type } from '@app/generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReminderDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsEnum(reminder_type)
  type: reminder_type;

  @IsOptional()
  @IsEnum(reminder_status)
  status: reminder_status = reminder_status.pending;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;
}
