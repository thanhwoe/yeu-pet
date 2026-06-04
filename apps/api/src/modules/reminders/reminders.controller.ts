import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { Cacheable, CacheEvict } from '@app/decorators/cache.decorator';
import {
  type accounts,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { AllowValuesPipe } from '@app/pipes/allow-values.pipe';
import { NumberRangePipe } from '@app/pipes/number-range.pipe';

@Controller('reminders')
@UseGuards(PoliciesGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @CacheEvict()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Reminders'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.create(user.id, createReminderDto);
  }

  @Get()
  @Cacheable(30)
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
    @Query(
      'month',
      new DefaultValuePipe(new Date().getMonth() + 1),
      new NumberRangePipe(1, 12, 'month'),
    )
    month: number,
    @Query(
      'year',
      new DefaultValuePipe(new Date().getFullYear()),
      new NumberRangePipe(1970, 3000, 'year'),
    )
    year: number,
    @Query('status', new AllowValuesPipe(reminder_status))
    status?: reminder_status,
    @Query('type', new AllowValuesPipe(reminder_type))
    type?: reminder_type,
    @Query('petId')
    petId?: string,
    @Query('from')
    from?: string,
    @Query('to')
    to?: string,
  ) {
    return this.remindersService.findAll(user.id, pagination, {
      month,
      year,
      status,
      type,
      petId,
      from,
      to,
    });
  }

  @Get('upcoming')
  @Cacheable(30)
  @HttpCode(HttpStatus.OK)
  findUpcoming(
    @CurrentUser() user: accounts,
    @Query(
      'limit',
      new DefaultValuePipe(5),
      new NumberRangePipe(1, 20, 'limit'),
    )
    limit: number,
  ) {
    return this.remindersService.findUpcoming(user.id, limit);
  }

  @Get(':id')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.remindersService.findOne(user, id);
  }

  @Patch(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user, id, updateReminderDto);
  }

  @Delete(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.remindersService.remove(user, id);
  }

  @Post(':id/complete')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.remindersService.complete(user, id);
  }

  @Post(':id/skip')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  skip(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.remindersService.skip(user, id);
  }

  @Post(':id/cancel')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.remindersService.cancel(user, id);
  }
}
