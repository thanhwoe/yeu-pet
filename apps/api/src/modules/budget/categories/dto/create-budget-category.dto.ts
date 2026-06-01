import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBudgetCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  color: string;

  @IsString()
  @IsOptional()
  emoji: string;
}
