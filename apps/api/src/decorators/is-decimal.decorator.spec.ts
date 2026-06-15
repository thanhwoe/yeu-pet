import { Decimal } from '@prisma/client/runtime/client';
import { plainToInstance } from 'class-transformer';
import { IsOptional, validateSync } from 'class-validator';
import { IsDecimal } from './is-decimal.decorator';

class DecimalDto {
  @IsOptional()
  @IsDecimal()
  amount?: Decimal;
}

describe('IsDecimal', () => {
  it('accepts numeric strings from multipart form data', () => {
    const dto = plainToInstance(DecimalDto, { amount: '4.2' });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.amount).toBeInstanceOf(Decimal);
    expect(dto.amount?.toString()).toBe('4.2');
  });

  it('treats blank optional decimal fields as omitted', () => {
    const dto = plainToInstance(DecimalDto, { amount: '' });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.amount).toBeUndefined();
  });
});
