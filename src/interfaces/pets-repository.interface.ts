import { pets } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export type IPetsRepository = IBaseRepository<pets>;
