import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import dayjs from 'dayjs';
import {
  accounts,
  reminders,
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '@app/utils/pagination';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private isProcessingReminders = false;

  constructor(
    @Inject(IRemindersRepository)
    private readonly remindersRepository: IRemindersRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}
  async create(userId: string, createReminderDto: CreateReminderDto) {
    if (createReminderDto.petId) {
      await this.assertPetOwner(userId, createReminderDto.petId);
    }

    await this.subscriptionService.assertCanCreateReminder(userId, {
      repeatFrequency: createReminderDto.repeatFrequency,
    });

    return this.remindersRepository.create({
      accounts: {
        connect: {
          id: userId,
        },
      },
      pets: createReminderDto.petId
        ? {
            connect: {
              id: createReminderDto.petId,
            },
          }
        : undefined,
      custom_type: createReminderDto.customType,
      description: createReminderDto.description,
      notification_provider_id: null,
      repeat_frequency:
        createReminderDto.repeatFrequency ?? reminder_repeat_frequency.none,
      repeat_interval: createReminderDto.repeatInterval,
      repeat_until: createReminderDto.repeatUntil
        ? dayjs(createReminderDto.repeatUntil).toDate()
        : undefined,
      scheduled_at: dayjs(createReminderDto.scheduledAt).toDate(),
      status: createReminderDto.status,
      timezone: createReminderDto.timezone,
      title: createReminderDto.title,
      type: createReminderDto.type,
    });
  }

  async findAll(
    userId: string,
    pagination: PaginationDto,
    filters: {
      month?: number;
      year?: number;
      from?: string;
      to?: string;
      petId?: string;
      type?: reminder_type;
      status?: reminder_status;
    },
  ) {
    if (filters.petId) {
      await this.assertPetOwner(userId, filters.petId);
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const range = this.resolveDateRange(filters);

    const [data, total] = await this.remindersRepository.findAll({
      account_id: userId,
      status: filters.status,
      type: filters.type,
      pet_id: filters.petId,
      skip,
      take: limit,
      endDate: range.end,
      startDate: range.start,
    });

    return paginate(data, total, page, limit);
  }

  async findUpcoming(userId: string, limit: number) {
    const [data, total] = await this.remindersRepository.findAll({
      account_id: userId,
      status: reminder_status.pending,
      skip: 0,
      take: limit,
      startDate: new Date(),
      endDate: dayjs().add(1, 'year').toDate(),
    });

    return paginate(data, total, 1, limit);
  }

  private resolveDateRange(filters: {
    month?: number;
    year?: number;
    from?: string;
    to?: string;
  }) {
    if (filters.from || filters.to) {
      return {
        start: filters.from
          ? dayjs(filters.from).toDate()
          : dayjs().startOf('day').toDate(),
        end: filters.to
          ? dayjs(filters.to).toDate()
          : dayjs().add(1, 'year').toDate(),
      };
    }

    const time = dayjs()
      .year(filters.year ?? new Date().getFullYear())
      .month((filters.month ?? new Date().getMonth() + 1) - 1);

    return {
      start: time.startOf('month').toDate(),
      end: time.endOf('month').toDate(),
    };
  }

  async findAllLegacy(
    userId: string,
    pagination: PaginationDto,
    month: number,
    year: number,
    status?: reminder_status,
  ) {
    return this.findAll(userId, pagination, {
      month,
      year,
      status,
    });
  }

  async findOne(user: accounts, id: string) {
    const record = await this.assertOwner(user, id);

    return record;
  }

  async update(
    user: accounts,
    id: string,
    updateReminderDto: UpdateReminderDto,
  ) {
    await this.assertOwner(user, id);
    if (updateReminderDto.petId) {
      await this.assertPetOwner(user.id, updateReminderDto.petId);
    }

    if (
      updateReminderDto.repeatFrequency &&
      updateReminderDto.repeatFrequency !== reminder_repeat_frequency.none
    ) {
      await this.subscriptionService.assertCanCreateReminder(user.id, {
        repeatFrequency: updateReminderDto.repeatFrequency,
      });
    }

    return this.remindersRepository.update(id, {
      pets: updateReminderDto.petId
        ? {
            connect: {
              id: updateReminderDto.petId,
            },
          }
        : undefined,
      custom_type: updateReminderDto.customType,
      description: updateReminderDto.description,
      repeat_frequency: updateReminderDto.repeatFrequency,
      repeat_interval: updateReminderDto.repeatInterval,
      repeat_until: updateReminderDto.repeatUntil
        ? dayjs(updateReminderDto.repeatUntil).toDate()
        : undefined,
      scheduled_at: updateReminderDto.scheduledAt
        ? dayjs(updateReminderDto.scheduledAt).toDate()
        : undefined,
      status: updateReminderDto.status,
      timezone: updateReminderDto.timezone,
      title: updateReminderDto.title,
      type: updateReminderDto.type,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertOwner(user, id);
    await this.remindersRepository.delete(id);
  }

  async complete(user: accounts, id: string) {
    const reminder = await this.assertOwner(user, id);
    const updated = await this.remindersRepository.update(id, {
      status: reminder_status.completed,
      completed_at: new Date(),
    });
    await this.scheduleNextRecurringReminder(reminder);
    return updated;
  }

  async skip(user: accounts, id: string) {
    const reminder = await this.assertOwner(user, id);
    const updated = await this.remindersRepository.update(id, {
      status: reminder_status.skipped,
    });
    await this.scheduleNextRecurringReminder(reminder);
    return updated;
  }

  async cancel(user: accounts, id: string) {
    await this.assertOwner(user, id);
    return this.remindersRepository.update(id, {
      status: reminder_status.cancelled,
      cancelled_at: new Date(),
    });
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.remindersRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Reminder with ID ${id} not found`);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }

  private async assertPetOwner(userId: string, petId: string) {
    const pet = await this.petsRepository.findByUser(userId, petId);

    if (!pet) {
      throw new NotFoundException(
        `Pet with ID ${petId} not found or does not belong to you`,
      );
    }

    return pet;
  }

  async processReminders() {
    if (this.isProcessingReminders) {
      return;
    }

    this.isProcessingReminders = true;
    try {
      await this.processDueReminders();
    } finally {
      this.isProcessingReminders = false;
    }
  }

  private async processDueReminders() {
    const now = dayjs();
    const dueReminders = await this.remindersRepository.findMany({
      where: {
        status: reminder_status.pending,
        scheduled_at: {
          gte: now.subtract(24, 'hours').toDate(),
          lte: now.toDate(),
        },
      },
    });

    for (const reminder of dueReminders) {
      const claimed = await this.remindersRepository.claimForNotification(
        reminder.id,
      );
      if (!claimed) {
        continue;
      }

      try {
        const notification =
          await this.notificationsService.sendReminderDueNotification(reminder);

        await this.remindersRepository.update(reminder.id, {
          status: reminder_status.sent,
          notification_provider_id: notification.id,
        });
        await this.scheduleNextRecurringReminder(reminder);
      } catch (error: unknown) {
        await this.remindersRepository.update(reminder.id, {
          notification_provider_id: null,
        });
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to process reminder ${reminder.id}: ${message}`,
        );
      }
    }
  }

  private async scheduleNextRecurringReminder(reminder: reminders) {
    try {
      await this.createNextRecurringReminder(reminder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to schedule next occurrence for reminder ${reminder.id}: ${message}`,
      );
    }
  }

  private async createNextRecurringReminder(reminder: reminders) {
    const nextScheduledAt = this.getNextScheduledAt(reminder);
    if (!nextScheduledAt) {
      return;
    }

    const rootReminderId = reminder.parent_reminder_id ?? reminder.id;
    const existing = await this.remindersRepository.findMany({
      where: {
        parent_reminder_id: rootReminderId,
        scheduled_at: nextScheduledAt,
      },
    });
    if (existing.length) {
      return;
    }

    await this.remindersRepository.create({
      accounts: {
        connect: {
          id: reminder.account_id,
        },
      },
      pets: reminder.pet_id
        ? {
            connect: {
              id: reminder.pet_id,
            },
          }
        : undefined,
      parent_reminder: {
        connect: {
          id: rootReminderId,
        },
      },
      title: reminder.title,
      description: reminder.description,
      type: reminder.type,
      custom_type: reminder.custom_type,
      status: reminder_status.pending,
      scheduled_at: nextScheduledAt,
      timezone: reminder.timezone,
      repeat_frequency: reminder.repeat_frequency,
      repeat_interval: reminder.repeat_interval,
      repeat_until: reminder.repeat_until,
      notification_provider_id: null,
    });
  }

  private getNextScheduledAt(reminder: reminders) {
    const interval = reminder.repeat_interval ?? 1;
    const scheduledAt = dayjs(reminder.scheduled_at);
    let nextScheduledAt: dayjs.Dayjs;

    switch (reminder.repeat_frequency) {
      case reminder_repeat_frequency.daily:
        nextScheduledAt = scheduledAt.add(interval, 'day');
        break;
      case reminder_repeat_frequency.weekly:
        nextScheduledAt = scheduledAt.add(interval, 'week');
        break;
      case reminder_repeat_frequency.monthly:
        nextScheduledAt = scheduledAt.add(interval, 'month');
        break;
      case reminder_repeat_frequency.yearly:
        nextScheduledAt = scheduledAt.add(interval, 'year');
        break;
      default:
        return null;
    }

    if (
      reminder.repeat_until &&
      nextScheduledAt.isAfter(dayjs(reminder.repeat_until))
    ) {
      return null;
    }

    return nextScheduledAt.toDate();
  }
}
