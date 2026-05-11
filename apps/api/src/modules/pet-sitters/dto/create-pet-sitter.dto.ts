import { IsDecimal } from '@app/decorators/is-decimal.decorator';
import { Decimal } from '@prisma/client/runtime/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePetSitterDto {
  @IsString()
  @IsOptional()
  bio: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsDecimal()
  hourlyRate: Decimal;

  @IsNotEmpty()
  @IsDecimal()
  dailyRate: Decimal;
}
