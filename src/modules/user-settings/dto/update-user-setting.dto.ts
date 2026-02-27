import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingDto {
  @IsOptional()
  @IsBoolean()
  notificationEnable?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}
