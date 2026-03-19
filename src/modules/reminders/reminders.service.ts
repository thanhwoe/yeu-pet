import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersRepository } from './reminders.repository';
import dayjs from 'dayjs';
import { accounts, reminder_status } from '@app/generated/prisma/client';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';
import { NotificationsService } from '../notifications/notifications.service';
import { UserSettingsRepository } from '../user-settings/user-settings.repository';
import { paginate } from '@app/utils/pagination';
import { PaginationDto } from '../shared/dto/pagination.dto';

@Injectable()
export class RemindersService {
  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly notificationsService: NotificationsService,
    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}
  async create(userId: string, createReminderDto: CreateReminderDto) {
    return this.remindersRepository.create({
      account_id: userId,
      description: createReminderDto.description,
      pet_id: createReminderDto.petId,
      scheduled_at: dayjs(createReminderDto.scheduledAt).toDate(),
      status: createReminderDto.status,
      title: createReminderDto.title,
      type: createReminderDto.type,
    });
  }

  async findAll(
    userId: string,
    pagination: PaginationDto,
    status?: reminder_status,
  ) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.remindersRepository.findAll({
      account_id: userId,
      status,
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const record = await this.assertAbility(user, id, Action.Read);

    return record;
  }

  async update(
    user: accounts,
    id: string,
    updateReminderDto: UpdateReminderDto,
  ) {
    await this.assertAbility(user, id, Action.Update);

    return this.remindersRepository.update(id, {
      pet_id: updateReminderDto.petId,
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
    await this.assertAbility(user, id, Action.Delete);
    await this.remindersRepository.delete(id);
  }

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.remindersRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Reminder with ID ${id} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'Reminders', record);

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

      await this.notificationsService.sendNotification(reminder);

      await this.remindersRepository.update(reminder.id, {
        status: reminder_status.sent,
      });
    }
  }
}
