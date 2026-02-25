import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';

@Controller('reminders')
@UseGuards(PoliciesGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Reminders'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.create(user.id, createReminderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@CurrentUser() user: accounts) {
    return this.remindersService.findAll(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @Param('id') id: string) {
    return this.remindersService.findOne(user, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user, id, updateReminderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @Param('id') id: string) {
    return this.remindersService.remove(user, id);
  }
}
