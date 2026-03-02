import { Module } from '@nestjs/common';
import { BudgetTransactionsService } from './budget-transactions.service';
import { BudgetTransactionsController } from './budget-transactions.controller';
import { BudgetTransactionsRepository } from './budget-transactions.repository';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [BudgetTransactionsController],
  providers: [BudgetTransactionsService, BudgetTransactionsRepository],
})
export class BudgetTransactionsModule {}
