import {
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReminderDto {
  @IsOptional()
  @IsUUID()
  petId?: string;

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

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(reminder_repeat_frequency)
  repeatFrequency?: reminder_repeat_frequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  repeatInterval?: number;

  @IsOptional()
  @IsDateString()
  repeatUntil?: string;

  @IsOptional()
  @IsString()
  customType?: string;
}
