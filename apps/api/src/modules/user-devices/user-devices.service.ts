import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { accounts } from '@app/generated/prisma/client';
import {
  StaleDeviceRegistrationError,
  UserDevicesRepository,
} from './user-devices.repository';

@Injectable()
export class UserDevicesService {
  constructor(private readonly userDevicesRepository: UserDevicesRepository) {}
  async create(user: accounts, createUserDeviceDto: CreateUserDeviceDto) {
    if (/^(Expo|Exponent)PushToken\[/.test(createUserDeviceDto.pushToken)) {
      throw new BadRequestException(
        'Expo push tokens are not supported; register a Firebase token',
      );
    }

    try {
      return await this.userDevicesRepository.create({
        account_id: user.id,
        device_name: createUserDeviceDto.deviceName ?? null,
        installation_id: createUserDeviceDto.installationId,
        os_version: createUserDeviceDto.osVersion ?? null,
        platform: createUserDeviceDto.platform,
        push_token: createUserDeviceDto.pushToken,
        registration_generation: createUserDeviceDto.registrationGeneration,
      });
    } catch (error) {
      if (error instanceof StaleDeviceRegistrationError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  async remove(user: accounts, id: string) {
    await this.userDevicesRepository.deactivateOwned(id, user.id);
  }
}
