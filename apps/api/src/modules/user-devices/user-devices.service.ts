import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { accounts } from '@app/generated/prisma/client';
import { UserDevicesRepository } from './user-devices.repository';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';

@Injectable()
export class UserDevicesService {
  constructor(
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async create(user: accounts, createUserDeviceDto: CreateUserDeviceDto) {
    return this.userDevicesRepository.create({
      account_id: user.id,
      device_name: createUserDeviceDto.deviceName,
      os_version: createUserDeviceDto.osVersion,
      platform: createUserDeviceDto.platform,
      push_token: createUserDeviceDto.pushToken,
    });
  }

  async remove(user: accounts, id: string) {
    const record = await this.assertAbility(user, id, Action.Delete);

    if (!record.is_active) {
      throw new BadRequestException('Device token is already deactivated');
    }

    await this.userDevicesRepository.delete(id);
  }

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.userDevicesRepository.findById(id);

    if (!record)
      throw new NotFoundException(`User device with ID ${id} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'UserDevices', record);

    return record;
  }
}
