import { PartialType } from '@nestjs/swagger';
import { CreatePetSitterDto } from './create-pet-sitter.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePetSitterDto extends PartialType(CreatePetSitterDto) {
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
