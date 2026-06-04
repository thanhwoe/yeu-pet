import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiConversationDto {
  @IsUUID()
  @IsOptional()
  petId?: string;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  title?: string;
}
