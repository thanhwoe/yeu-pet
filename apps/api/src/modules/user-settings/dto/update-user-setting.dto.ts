import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateUserSettingDto {
  @IsOptional()
  @IsBoolean()
  notificationEnable?: boolean;

  @IsOptional()
  @IsBoolean()
  reminderNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  bookingNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  socialNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  aiNotifications?: boolean;

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: string;

  @IsOptional()
  @IsIn(['system', 'light', 'dark'])
  theme?: string;
}
