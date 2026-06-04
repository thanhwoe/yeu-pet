import { budget_transactions } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';
import { Decimal } from '@prisma/client/runtime/client';

export const IBudgetTransactionsRepository = Symbol(
  'IBudgetTransactionsRepository',
);

export interface IBudgetTransactionsRepository extends IBaseRepository<budget_transactions> {
  sum(params: {
    account_id: string;
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }): Promise<{
    amount: Decimal | null;
    count: number;
  }>;

  sumGroupByCategory(params: {
    account_id: string;
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }): Promise<
    {
      category_id: string;
      _sum: {
        amount: Decimal | null;
      };
      _count: number;
    }[]
  >;

  findAllByDate(params: {
    account_id: string;
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }): Promise<{ date: Date; amount: Decimal }[]>;
}
