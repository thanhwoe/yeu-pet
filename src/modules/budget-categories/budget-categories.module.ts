import { Module } from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { BudgetCategoriesController } from './budget-categories.controller';
import { BudgetCategoriesRepository } from './budget-categories.repository';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [BudgetCategoriesController],
  providers: [BudgetCategoriesService, BudgetCategoriesRepository],
  exports: [BudgetCategoriesRepository],
})
export class BudgetCategoriesModule {}
