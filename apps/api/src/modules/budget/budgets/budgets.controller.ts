import {
  Controller,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetAmountDto } from './dto/update-budget.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { Cacheable, CacheEvict } from '@app/decorators/cache.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { NumberRangePipe } from '@app/pipes/number-range.pipe';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @CacheEvict()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(user, createBudgetDto);
  }

  @Get()
  @Cacheable(30)
  @HttpCode(HttpStatus.OK)
  findOne(
    @CurrentUser() user: accounts,
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
  ) {
    return this.budgetsService.findOne(user, month, year);
  }

  @Patch()
  @CacheEvict()
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @CurrentUser() user: accounts,
    @Body() updateBudgetDto: UpdateBudgetAmountDto,
  ) {
    return this.budgetsService.updateAmount(user, updateBudgetDto);
  }

  @Get('statistics/monthly')
  @Cacheable(30)
  @HttpCode(HttpStatus.OK)
  statisticsMonthly(
    @CurrentUser() user: accounts,
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
  ) {
    return this.budgetsService.getMonthlyStatistics(user, month, year);
  }

  @Get('statistics/yearly')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  statisticsYearly(
    @CurrentUser() user: accounts,
    @Query(
      'year',
      new DefaultValuePipe(new Date().getFullYear()),
      new NumberRangePipe(1970, 3000, 'year'),
    )
    year: number,
  ) {
    return this.budgetsService.getYearlyStatistics(user, year);
  }
}
