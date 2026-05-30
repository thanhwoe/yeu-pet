import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { BudgetTransactionsModule } from '../budget-transactions/budget-transactions.module';
import { BudgetsRepository } from './budgets.repository';
import { BudgetCategoriesModule } from '../budget-categories/budget-categories.module';

@Module({
  imports: [
    BudgetTransactionsModule,
    BudgetCategoriesModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsRepository],
})
export class BudgetsModule {}
