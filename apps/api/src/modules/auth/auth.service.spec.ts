import { AuthService } from './auth.service';

describe('AuthService logout device ownership', () => {
  const refreshTokensRepository = {
    revokeByTokenHash: jest.fn(),
    revokeByUserId: jest.fn(),
  };
  const userDevicesRepository = {
    deactivateOwned: jest.fn(),
  };
  const service = new AuthService(
    {} as never,
    {} as never,
    {} as never,
    refreshTokensRepository as never,
    userDevicesRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deactivates only the current account device before revoking its token', async () => {
    userDevicesRepository.deactivateOwned.mockResolvedValue(1);
    refreshTokensRepository.revokeByTokenHash.mockResolvedValue(undefined);

    await service.logout('account-id', 'refresh-token', 'device-id');

    expect(userDevicesRepository.deactivateOwned).toHaveBeenCalledWith(
      'device-id',
      'account-id',
    );
    expect(refreshTokensRepository.revokeByTokenHash).toHaveBeenCalledTimes(1);
    expect(
      userDevicesRepository.deactivateOwned.mock.invocationCallOrder[0],
    ).toBeLessThan(
      refreshTokensRepository.revokeByTokenHash.mock.invocationCallOrder[0],
    );
  });

  it('does not deactivate every device when no device ID is supplied', async () => {
    refreshTokensRepository.revokeByUserId.mockResolvedValue(undefined);

    await service.logout('account-id');

    expect(userDevicesRepository.deactivateOwned).not.toHaveBeenCalled();
    expect(refreshTokensRepository.revokeByUserId).toHaveBeenCalledWith(
      'account-id',
    );
  });
});
