import {
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { Test } from '@nestjs/testing';
import dayjs from 'dayjs';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  const remindersRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    claimForNotification: jest.fn().mockResolvedValue(true),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };
  const subscriptionService = {
    assertCanCreateReminder: jest.fn(),
  };
  const notificationsService = {
    sendReminderDueNotification: jest.fn(),
  };

  let service: RemindersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: IRemindersRepository, useValue: remindersRepository },
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: NotificationsService, useValue: notificationsService },
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
      description: '',
      status: reminder_status.pending,
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
        status: reminder_status.pending,
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

  it('processes due reminders without sending them early', async () => {
    const scheduledAt = dayjs().subtract(1, 'minute').toDate();
    remindersRepository.findMany.mockResolvedValue([
      {
        id: 'reminder-1',
        account_id: 'account-1',
        scheduled_at: scheduledAt,
        repeat_frequency: reminder_repeat_frequency.none,
      },
    ]);
    notificationsService.sendReminderDueNotification.mockResolvedValue({
      id: 'notification-1',
    });

    await service.processReminders();

    expect(remindersRepository.findMany).toHaveBeenCalledWith({
      where: {
        status: reminder_status.pending,
        scheduled_at: {
          gte: expect.any(Date) as Date,
          lte: expect.any(Date) as Date,
        },
      },
    });
    expect(
      notificationsService.sendReminderDueNotification,
    ).toHaveBeenCalledWith(expect.objectContaining({ id: 'reminder-1' }));
    expect(remindersRepository.update).toHaveBeenCalledWith('reminder-1', {
      status: reminder_status.sent,
      notification_provider_id: 'notification-1',
    });
  });

  it('creates the next occurrence after a recurring reminder is sent', async () => {
    const scheduledAt = dayjs().subtract(1, 'minute').startOf('second');
    const reminder = {
      id: 'reminder-1',
      account_id: 'account-1',
      pet_id: null,
      parent_reminder_id: null,
      title: 'Give medication',
      description: null,
      type: reminder_type.medication,
      custom_type: null,
      status: reminder_status.pending,
      scheduled_at: scheduledAt.toDate(),
      timezone: 'Asia/Ho_Chi_Minh',
      repeat_frequency: reminder_repeat_frequency.daily,
      repeat_interval: 2,
      repeat_until: scheduledAt.add(7, 'days').toDate(),
    };
    remindersRepository.findMany
      .mockResolvedValueOnce([reminder])
      .mockResolvedValueOnce([]);
    notificationsService.sendReminderDueNotification.mockResolvedValue({
      id: 'notification-1',
    });

    await service.processReminders();

    expect(remindersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Give medication',
        status: reminder_status.pending,
        scheduled_at: scheduledAt.add(2, 'days').toDate(),
        parent_reminder: {
          connect: { id: 'reminder-1' },
        },
      }),
    );
  });
});
