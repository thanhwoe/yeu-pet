import { device_platform } from '@app/generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDeviceDto {
  @IsString()
  @IsNotEmpty()
  pushToken: string;

  @IsString()
  @IsEnum(device_platform)
  @IsNotEmpty()
  platform: device_platform;

  @IsString()
  @IsOptional()
  deviceName: string;

  @IsString()
  @IsOptional()
  osVersion: string;
}
