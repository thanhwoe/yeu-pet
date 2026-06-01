import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { SharedModule } from '../shared/shared.module';
import { BudgetCategoriesController } from './categories/budget-categories.controller';
import { BudgetCategoriesRepository } from './categories/budget-categories.repository';
import { BudgetCategoriesService } from './categories/budget-categories.service';
import { BudgetTransactionsController } from './transactions/budget-transactions.controller';
import { BudgetTransactionsRepository } from './transactions/budget-transactions.repository';
import { BudgetTransactionsService } from './transactions/budget-transactions.service';
import { BudgetsController } from './budgets/budgets.controller';
import { BudgetsRepository } from './budgets/budgets.repository';
import { BudgetsService } from './budgets/budgets.service';

@Module({
  imports: [SharedModule, CaslModule],
  controllers: [
    BudgetCategoriesController,
    BudgetTransactionsController,
    BudgetsController,
  ],
  providers: [
    BudgetCategoriesRepository,
    BudgetCategoriesService,
    BudgetTransactionsRepository,
    BudgetTransactionsService,
    BudgetsRepository,
    BudgetsService,
  ],
  exports: [
    BudgetCategoriesRepository,
    BudgetTransactionsRepository,
    BudgetsRepository,
  ],
})
export class BudgetModule {}
