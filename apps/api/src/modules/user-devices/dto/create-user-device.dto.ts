import { device_platform } from '@app/generated/prisma/enums';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  pushToken: string;

  @IsUUID()
  installationId: string;

  @IsInt()
  @Min(1)
  registrationGeneration: number;

  @IsString()
  @IsEnum(device_platform)
  @IsNotEmpty()
  platform: device_platform;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  deviceName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  osVersion?: string;
}
