import { Decimal } from '@prisma/client/runtime/client';
import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBudgetTransactionDto {
  @IsDecimal()
  @IsNotEmpty()
  amount: Decimal;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
