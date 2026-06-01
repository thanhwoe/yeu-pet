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
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { IBudgetsRepository } from '@app/interfaces/budgets-repository.interface';

@Module({
  imports: [SharedModule, CaslModule],
  controllers: [
    BudgetCategoriesController,
    BudgetTransactionsController,
    BudgetsController,
  ],
  providers: [
    BudgetCategoriesRepository,
    {
      provide: IBudgetCategoriesRepository,
      useExisting: BudgetCategoriesRepository,
    },
    BudgetCategoriesService,
    BudgetTransactionsRepository,
    {
      provide: IBudgetTransactionsRepository,
      useExisting: BudgetTransactionsRepository,
    },
    BudgetTransactionsService,
    BudgetsRepository,
    { provide: IBudgetsRepository, useExisting: BudgetsRepository },
    BudgetsService,
  ],
  exports: [
    BudgetCategoriesRepository,
    IBudgetCategoriesRepository,
    BudgetTransactionsRepository,
    IBudgetTransactionsRepository,
    BudgetsRepository,
    IBudgetsRepository,
  ],
})
export class BudgetModule {}
