import { gender_enum, species_enum } from '@app/generated/prisma/enums';
import {
  IsDateString,
  IsIn,
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
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(gender_enum))
  gender: gender_enum;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(species_enum))
  species: species_enum;

  @IsOptional()
  @IsString()
  notes: string;
}
