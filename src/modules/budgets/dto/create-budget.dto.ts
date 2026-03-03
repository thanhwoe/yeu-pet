import { Decimal } from '@prisma/client/runtime/client';
import { IsInstance, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBudgetDto {
  @Transform(({ value }: { value: unknown }) => {
    if (value instanceof Decimal) return value;
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return new Decimal(value);
    return value;
  })
  @IsNotEmpty()
  @IsInstance(Decimal, {
    message: 'amount must be a decimal or number',
  })
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
