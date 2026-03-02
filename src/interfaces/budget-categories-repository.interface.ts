import { budget_categories } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export type IBudgetCategoriesRepository = IBaseRepository<budget_categories>;
