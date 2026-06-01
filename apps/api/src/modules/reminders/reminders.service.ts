import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import dayjs from 'dayjs';
import { accounts, reminder_status } from '@app/generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { UserSettingsRepository } from '../user-settings/user-settings.repository';
import { paginate } from '@app/utils/pagination';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';

@Injectable()
export class RemindersService {
  constructor(
    @Inject(IRemindersRepository)
    private readonly remindersRepository: IRemindersRepository,
    private readonly notificationsService: NotificationsService,
    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}
  async create(userId: string, createReminderDto: CreateReminderDto) {
    return this.remindersRepository.create({
      accounts: {
        connect: {
          id: userId,
        },
      },
      pets: {
        connect: {
          id: createReminderDto.petId,
        },
      },
      description: createReminderDto.description,
      scheduled_at: dayjs(createReminderDto.scheduledAt).toDate(),
      status: createReminderDto.status,
      title: createReminderDto.title,
      type: createReminderDto.type,
    });
  }

  async findAll(
    userId: string,
    pagination: PaginationDto,
    month: number,
    year: number,
    status?: reminder_status,
  ) {
    const { page = 1, limit } = pagination;
    const skip = (page - 1) * (limit ?? 0);

    const time = dayjs()
      .year(year)
      .month(month - 1);
    const start = time.startOf('month').toDate();
    const end = time.endOf('month').toDate();

    const [data, total] = await this.remindersRepository.findAll({
      account_id: userId,
      status,
      skip,
      take: limit,
      endDate: end,
      startDate: start,
    });

    return paginate(data, total, page, limit ?? 0);
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

    return this.remindersRepository.update(id, {
      pets: {
        connect: {
          id: updateReminderDto.petId,
        },
      },
      description: updateReminderDto.description,
      title: updateReminderDto.title,
      scheduled_at: updateReminderDto.scheduledAt
        ? dayjs(updateReminderDto.scheduledAt).toDate()
        : undefined,
      status: updateReminderDto.status,
      type: updateReminderDto.type,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertOwner(user, id);
    await this.remindersRepository.delete(id);
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.remindersRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Reminder with ID ${id} not found`);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
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
