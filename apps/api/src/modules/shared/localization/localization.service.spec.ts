import { LocalizationService } from './localization.service';

describe('LocalizationService', () => {
  const prisma = {
    account_settings: {
      findUnique: jest.fn(),
    },
  };

  let service: LocalizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalizationService(prisma as never);
  });

  it('normalizes supported language and locale values', () => {
    expect(service.normalizeLanguage('vi')).toBe('vi');
    expect(service.normalizeLanguage('vi-VN')).toBe('vi');
    expect(service.normalizeLanguage('en')).toBe('en');
    expect(service.normalizeLanguage('en-US,en;q=0.9')).toBe('en');
    expect(service.normalizeLanguage('fr-FR')).toBe('vi');
    expect(service.normalizeLanguage(null)).toBe('vi');
  });

  it('translates with params and falls back to Vietnamese or the key', () => {
    expect(
      service.translate('notifications.booking.request.body', 'en', {
        petName: 'Mochi',
      }),
    ).toBe('You have a new booking request for Mochi.');

    expect(
      service.translate('notifications.booking.request.body', 'vi', {
        petName: 'Mochi',
      }),
    ).toBe('Bạn có một yêu cầu đặt lịch mới cho Mochi.');

    expect(service.translate('missing.key', 'en')).toBe('missing.key');
  });

  it('resolves account language from account settings', async () => {
    prisma.account_settings.findUnique.mockResolvedValue({ language: 'en-GB' });

    await expect(service.resolveLanguageForAccount('account-1')).resolves.toBe(
      'en',
    );
    expect(prisma.account_settings.findUnique).toHaveBeenCalledWith({
      where: { account_id: 'account-1' },
      select: { language: true },
    });
  });
});
