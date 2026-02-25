import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersRepository } from './reminders.repository';
import dayjs from 'dayjs';
import { accounts } from '@app/generated/prisma/client';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';

@Injectable()
export class RemindersService {
  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
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

  async findAll(userId: string) {
    return this.remindersRepository.findAll({ account_id: userId });
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
}
