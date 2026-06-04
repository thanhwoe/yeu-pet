import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSitterBookingReviewDto {
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5])
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
