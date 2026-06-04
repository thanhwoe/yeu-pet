import {
  gender_enum,
  species_enum,
  weight_unit,
} from '@app/generated/prisma/enums';
import { IsDecimal } from '@app/decorators/is-decimal.decorator';
import { Decimal } from '@prisma/client/runtime/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  age: number;

  @IsOptional()
  @IsDateString()
  birthdate: string;

  @IsOptional()
  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  weight: string;

  @IsOptional()
  @IsDecimal()
  weightValue?: Decimal;

  @IsOptional()
  @IsEnum(weight_unit)
  weightUnit?: weight_unit;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  @IsEnum(gender_enum)
  gender: gender_enum;

  @IsOptional()
  @IsString()
  @IsEnum(species_enum)
  species: species_enum;

  @IsOptional()
  @IsString()
  notes: string;
}
