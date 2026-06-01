import { Decimal } from '@prisma/client/runtime/client';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { IsDecimal } from '@app/decorators/is-decimal.decorator';

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsDecimal()
  amount: Decimal;

  @IsNumber()
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  month: number;

  @IsNumber()
  @Min(1900, { message: 'year must be a valid year' })
  @Max(3000, { message: 'year must be a valid year' })
  year: number;
}
