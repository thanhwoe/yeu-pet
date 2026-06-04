import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAiMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;
}
