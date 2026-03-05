import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsBoolean()
  @IsNotEmpty()
  isPrivate: boolean;
}
