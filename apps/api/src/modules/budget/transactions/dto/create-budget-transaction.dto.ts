import { IsDecimal } from '@app/decorators/is-decimal.decorator';
import { Decimal } from '@prisma/client/runtime/client';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBudgetTransactionDto {
  @IsNotEmpty()
  @IsDecimal()
  amount: Decimal;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  petId?: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
