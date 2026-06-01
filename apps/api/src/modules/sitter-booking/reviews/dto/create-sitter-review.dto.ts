import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSitterReviewDto {
  @IsUUID()
  @IsNotEmpty()
  sitterId: string;

  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5])
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
