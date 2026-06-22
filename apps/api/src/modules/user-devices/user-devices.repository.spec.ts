import { device_platform } from '@app/generated/prisma/enums';
import { UserDevicesRepository } from './user-devices.repository';

describe('UserDevicesRepository ownership safety', () => {
  const executeRaw = jest.fn();
  const transactionDevices = {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  };
  const accountDevices = {
    updateMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  };
  const prisma = {
    account_devices: accountDevices,
    $transaction: jest.fn(
      (
        operation: (tx: {
          $executeRaw: jest.Mock;
          account_devices: typeof transactionDevices;
        }) => unknown,
      ) =>
        operation({
          $executeRaw: executeRaw.mockResolvedValue(0),
          account_devices: transactionDevices,
        }),
    ),
  };
  const repository = new UserDevicesRepository(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retires other tokens for an installation before upserting ownership', async () => {
    transactionDevices.updateMany.mockResolvedValue({ count: 1 });
    transactionDevices.upsert.mockResolvedValue({ id: 'device-id' });

    await repository.create({
      account_id: '123e4567-e89b-42d3-a456-426614174001',
      push_token: 'new-token',
      installation_id: '123e4567-e89b-42d3-a456-426614174002',
      registration_generation: 2,
      platform: device_platform.android,
      device_name: 'Pixel',
      os_version: '15',
    });

    expect(transactionDevices.updateMany).toHaveBeenCalledWith({
      where: {
        installation_id: '123e4567-e89b-42d3-a456-426614174002',
        is_active: true,
        push_token: { not: 'new-token' },
      },
      data: {
        is_active: false,
        updated_at: expect.any(Date) as Date,
      },
    });
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(transactionDevices.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { push_token: 'new-token' },
        update: expect.objectContaining({
          account_id: '123e4567-e89b-42d3-a456-426614174001',
          installation_id: '123e4567-e89b-42d3-a456-426614174002',
          is_active: true,
          platform: device_platform.android,
          registration_generation: 2,
        }) as Record<string, unknown>,
      }),
    );
  });

  it('rejects an older registration after a newer account session owns the installation', async () => {
    transactionDevices.findFirst.mockResolvedValueOnce({
      account_id: 'account-b',
      registration_generation: 2,
    });

    await expect(
      repository.create({
        account_id: 'account-a',
        push_token: 'old-token',
        installation_id: '123e4567-e89b-42d3-a456-426614174002',
        registration_generation: 1,
        platform: device_platform.android,
        device_name: null,
        os_version: null,
      }),
    ).rejects.toMatchObject({ name: 'StaleDeviceRegistrationError' });

    expect(transactionDevices.updateMany).not.toHaveBeenCalled();
    expect(transactionDevices.upsert).not.toHaveBeenCalled();
  });

  it('deactivates only a row still owned by the authenticated account', async () => {
    accountDevices.updateMany.mockResolvedValue({ count: 0 });

    await repository.deactivateOwned('device-id', 'account-a');

    expect(accountDevices.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'device-id',
        account_id: 'account-a',
        is_active: true,
      },
      data: {
        is_active: false,
        updated_at: expect.any(Date) as Date,
      },
    });
  });

  it('targets only active devices belonging to an active account', async () => {
    accountDevices.findMany.mockResolvedValue([]);

    await repository.findActiveByAccountId('account-a');

    expect(accountDevices.findMany).toHaveBeenCalledWith({
      where: {
        account_id: 'account-a',
        is_active: true,
        accounts: { is_active: true },
      },
      orderBy: { created_at: 'desc' },
    });
  });
});
