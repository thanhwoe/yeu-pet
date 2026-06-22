import { BadRequestException, ConflictException } from '@nestjs/common';
import { device_platform } from '@app/generated/prisma/enums';
import { UserDevicesService } from './user-devices.service';
import { StaleDeviceRegistrationError } from './user-devices.repository';

describe('UserDevicesService', () => {
  const userDevicesRepository = {
    create: jest.fn(),
    deactivateOwned: jest.fn(),
  };
  const service = new UserDevicesService(userDevicesRepository as never);
  const user = { id: '123e4567-e89b-42d3-a456-426614174001' } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the token for the authenticated account and installation', async () => {
    userDevicesRepository.create.mockResolvedValue({ id: 'device-id' });

    await service.create(user, {
      pushToken: 'firebase-token',
      installationId: '123e4567-e89b-42d3-a456-426614174002',
      registrationGeneration: 2,
      platform: device_platform.android,
      deviceName: 'Pixel',
      osVersion: '15',
    });

    expect(userDevicesRepository.create).toHaveBeenCalledWith({
      account_id: '123e4567-e89b-42d3-a456-426614174001',
      push_token: 'firebase-token',
      installation_id: '123e4567-e89b-42d3-a456-426614174002',
      registration_generation: 2,
      platform: device_platform.android,
      device_name: 'Pixel',
      os_version: '15',
    });
  });

  it('rejects Expo Push Service tokens', async () => {
    await expect(
      service.create(user, {
        pushToken: 'ExpoPushToken[legacy-token]',
        installationId: '123e4567-e89b-42d3-a456-426614174002',
        registrationGeneration: 1,
        platform: device_platform.android,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userDevicesRepository.create).not.toHaveBeenCalled();
  });

  it('returns a conflict for a stale account registration session', async () => {
    userDevicesRepository.create.mockRejectedValue(
      new StaleDeviceRegistrationError(),
    );

    await expect(
      service.create(user, {
        pushToken: 'firebase-token',
        installationId: '123e4567-e89b-42d3-a456-426614174002',
        registrationGeneration: 1,
        platform: device_platform.android,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('unregisters with one account-scoped conditional update', async () => {
    userDevicesRepository.deactivateOwned.mockResolvedValue(0);

    await expect(service.remove(user, 'device-id')).resolves.toBeUndefined();

    expect(userDevicesRepository.deactivateOwned).toHaveBeenCalledWith(
      'device-id',
      '123e4567-e89b-42d3-a456-426614174001',
    );
  });
});
