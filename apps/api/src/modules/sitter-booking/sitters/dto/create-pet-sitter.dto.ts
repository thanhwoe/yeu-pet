import { IsDecimal } from '@app/decorators/is-decimal.decorator';
import { Decimal } from '@prisma/client/runtime/client';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePetSitterDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @IsOptional()
  @IsDecimal()
  latitude?: Decimal;

  @IsOptional()
  @IsDecimal()
  longitude?: Decimal;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  serviceNotes?: string;

  @IsNotEmpty()
  @IsDecimal()
  hourlyRate: Decimal;

  @IsNotEmpty()
  @IsDecimal()
  dailyRate: Decimal;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxConcurrentBookings?: number;
}
