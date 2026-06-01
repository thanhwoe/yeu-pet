import { budgets } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';
import { Decimal } from '@prisma/client/runtime/client';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';

export const IBudgetsRepository = Symbol('IBudgetsRepository');

export interface IBudgetsRepository extends IBaseRepository<budgets> {
  findUnique(params: {
    account_id: string;
    month: number;
    year: number;
  }): Promise<budgets | null>;

  updateAmount(params: {
    amount: Decimal;
    month: number;
    year: number;
    account_id: string;
  }): Promise<BatchPayload>;
}
