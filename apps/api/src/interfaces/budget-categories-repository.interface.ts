import { budget_categories } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export interface IBudgetCategoriesRepository extends IBaseRepository<budget_categories> {
  findManyByIds(ids: string[]): Promise<budget_categories[]>;
}
