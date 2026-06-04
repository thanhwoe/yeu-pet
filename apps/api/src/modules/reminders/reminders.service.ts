import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import dayjs from 'dayjs';
import {
  accounts,
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { UserSettingsRepository } from '../user-settings/user-settings.repository';
import { paginate } from '@app/utils/pagination';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class RemindersService {
  constructor(
    @Inject(IRemindersRepository)
    private readonly remindersRepository: IRemindersRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly userSettingsRepository: UserSettingsRepository,
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
    await this.assertOwner(user, id);
    return this.remindersRepository.update(id, {
      status: reminder_status.completed,
      completed_at: new Date(),
    });
  }

  async skip(user: accounts, id: string) {
    await this.assertOwner(user, id);
    return this.remindersRepository.update(id, {
      status: reminder_status.skipped,
    });
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
    const now = dayjs();
    const start = now.toDate();
    const end = now.add(1, 'minute').toDate();

    // Regular reminders due right now (window of 1 min)
    const dueReminders = await this.remindersRepository.findMany({
      where: {
        status: reminder_status.pending,
        scheduled_at: {
          gte: start,
          lte: end,
        },
      },
    });

    for (const reminder of dueReminders) {
      const settings = await this.userSettingsRepository.findById(
        reminder.account_id,
      );

      // Cancel reminder if notification disable
      if (!settings?.notification_enable) {
        await this.remindersRepository.update(reminder.id, {
          status: reminder_status.cancelled,
        });
        return;
      }

      try {
        await this.notificationsService.sendNotification(reminder);

        await this.remindersRepository.update(reminder.id, {
          status: reminder_status.sent,
        });
      } catch {
        await this.remindersRepository.update(reminder.id, {
          status: reminder_status.cancelled,
        });
      }
    }
  }
}
