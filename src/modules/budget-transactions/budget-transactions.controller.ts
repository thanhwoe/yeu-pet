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
} from '@nestjs/common';
import { BudgetTransactionsService } from './budget-transactions.service';
import { CreateBudgetTransactionDto } from './dto/create-budget-transaction.dto';
import { UpdateBudgetTransactionDto } from './dto/update-budget-transaction.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { NumberRangePipe } from '@app/pipes/number-range.pipe';

@Controller('budgets/transactions')
@UseGuards(PoliciesGuard)
export class BudgetTransactionsController {
  constructor(
    private readonly budgetTransactionsService: BudgetTransactionsService,
  ) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'BudgetTransactions'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createBudgetTransactionDto: CreateBudgetTransactionDto,
  ) {
    return this.budgetTransactionsService.create(
      user,
      createBudgetTransactionDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
    @Query('month', new NumberRangePipe(1, 12, 'month'))
    month?: number,
    @Query('year', new NumberRangePipe(1970, 3000, 'year'))
    year?: number,
  ) {
    return this.budgetTransactionsService.findAll(
      user,
      pagination,
      month,
      year,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updateBudgetTransactionDto: UpdateBudgetTransactionDto,
  ) {
    return this.budgetTransactionsService.update(
      user,
      id,
      updateBudgetTransactionDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.budgetTransactionsService.remove(user, id);
  }
}
