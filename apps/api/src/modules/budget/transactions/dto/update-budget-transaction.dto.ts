import { PartialType } from '@nestjs/swagger';
import { CreateBudgetTransactionDto } from './create-budget-transaction.dto';

export class UpdateBudgetTransactionDto extends PartialType(
  CreateBudgetTransactionDto,
) {}
