import { Test, TestingModule } from '@nestjs/testing';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { BudgetCategoriesService } from './budget-categories.service';
import { BudgetCategoriesRepository } from './budget-categories.repository';
import type { accounts } from '@app/generated/prisma/client';

describe('BudgetCategoriesService', () => {
  let service: BudgetCategoriesService;
  let repository: jest.Mocked<Pick<BudgetCategoriesRepository, 'findAll'>>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetCategoriesService,
        {
          provide: IBudgetCategoriesRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<BudgetCategoriesService>(BudgetCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scopes list queries to the current user', async () => {
    repository.findAll.mockResolvedValue([[], 0]);
    const user = { id: 'user-1' } as accounts;

    await service.findAll(user, { page: 2, limit: 25 });

    expect(repository.findAll.mock.calls).toEqual([
      [{ account_id: 'user-1', skip: 25, take: 25 }],
    ]);
  });
});
