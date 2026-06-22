import { IsOptional, IsString, IsUUID } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsUUID()
  @IsOptional()
  deviceId?: string;
}
