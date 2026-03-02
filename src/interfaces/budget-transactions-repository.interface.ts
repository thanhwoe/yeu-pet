import { budget_transactions } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export type IBudgetTransactionsRepository =
  IBaseRepository<budget_transactions>;
