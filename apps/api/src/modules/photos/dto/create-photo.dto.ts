import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export type BooleanFormValue = boolean | 'true' | 'false' | '1' | '0';

const transformBooleanFormValue = (value: unknown): unknown => {
  const normalizedValue: unknown = Array.isArray(value)
    ? (value as unknown[])[0]
    : value;

  if (typeof normalizedValue === 'boolean') return normalizedValue;
  if (typeof normalizedValue !== 'string') return normalizedValue;

  const normalizedString = normalizedValue.trim().toLowerCase();

  if (normalizedString === 'true') return true;
  if (normalizedString === 'false') return false;
  if (normalizedString === '1') return '1';
  if (normalizedString === '0') return '0';

  return normalizedValue;
};

export class CreatePhotoDto {
  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsOptional()
  @IsUUID()
  petId?: string;

  @Transform(({ value }: { value: unknown }) =>
    transformBooleanFormValue(value),
  )
  @IsIn([true, false, 'true', 'false', '1', '0'], {
    message: 'isPrivate must be a boolean value',
  })
  @IsNotEmpty()
  isPrivate: BooleanFormValue;
}
