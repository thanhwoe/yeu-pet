import {
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { Test } from '@nestjs/testing';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UserSettingsRepository } from '../user-settings/user-settings.repository';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  const remindersRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };
  const subscriptionService = {
    assertCanCreateReminder: jest.fn(),
  };

  let service: RemindersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: IRemindersRepository, useValue: remindersRepository },
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: NotificationsService, useValue: {} },
        { provide: UserSettingsRepository, useValue: {} },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compile();

    service = moduleRef.get(RemindersService);
  });

  it('creates account-level reminders without requiring a pet', async () => {
    remindersRepository.create.mockResolvedValue({ id: 'reminder-1' });

    await service.create('account-1', {
      title: 'Buy food',
      type: reminder_type.feeding,
      scheduledAt: '2026-06-04T08:00:00.000Z',
      repeatFrequency: reminder_repeat_frequency.none,
    });

    expect(petsRepository.findByUser).not.toHaveBeenCalled();
    expect(subscriptionService.assertCanCreateReminder).toHaveBeenCalledWith(
      'account-1',
      { repeatFrequency: reminder_repeat_frequency.none },
    );
    expect(remindersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        pets: undefined,
        title: 'Buy food',
        status: undefined,
      }),
    );
  });

  it('marks reminders completed with completion timestamp', async () => {
    remindersRepository.findById.mockResolvedValue({
      id: 'reminder-1',
      account_id: 'account-1',
    });
    remindersRepository.update.mockResolvedValue({ id: 'reminder-1' });

    await service.complete(
      {
        id: 'account-1',
      } as never,
      'reminder-1',
    );

    expect(remindersRepository.update).toHaveBeenCalledWith(
      'reminder-1',
      expect.objectContaining({
        status: reminder_status.completed,
        completed_at: expect.any(Date) as Date,
      }),
    );
  });
});
