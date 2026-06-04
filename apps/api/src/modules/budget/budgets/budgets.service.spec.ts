import { Decimal } from '@prisma/client/runtime/client';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { IBudgetsRepository } from '@app/interfaces/budgets-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { Test } from '@nestjs/testing';
import { BudgetsService } from './budgets.service';

describe('BudgetsService', () => {
  const budgetsRepository = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const budgetTransactionsRepository = {
    sum: jest.fn(),
    sumGroupByCategory: jest.fn(),
    findAllByDate: jest.fn(),
  };
  const budgetCategoriesRepository = {
    findManyByIds: jest.fn(),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };

  let service: BudgetsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: IBudgetsRepository, useValue: budgetsRepository },
        {
          provide: IBudgetTransactionsRepository,
          useValue: budgetTransactionsRepository,
        },
        {
          provide: IBudgetCategoriesRepository,
          useValue: budgetCategoriesRepository,
        },
        { provide: IPetsRepository, useValue: petsRepository },
      ],
    }).compile();

    service = moduleRef.get(BudgetsService);
  });

  it('applies pet filter to monthly budget summary', async () => {
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    budgetsRepository.findUnique.mockResolvedValue({
      id: 'budget-1',
      account_id: 'account-1',
      amount: new Decimal(1000),
      month: 6,
      year: 2026,
    });
    budgetTransactionsRepository.sum.mockResolvedValue({
      amount: new Decimal(250),
      count: 2,
    });

    const result = await service.findOne(
      {
        id: 'account-1',
      } as never,
      6,
      2026,
      'pet-1',
    );

    expect(petsRepository.findByUser).toHaveBeenCalledWith(
      'account-1',
      'pet-1',
    );
    expect(budgetTransactionsRepository.sum).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'account-1',
        pet_id: 'pet-1',
      }),
    );
    expect(result).toMatchObject({
      amount: 1000,
      spent: 250,
      remaining: 750,
      usage_percent: 25,
      is_over_budget: false,
    });
  });

  it('applies pet filter to monthly statistics', async () => {
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    budgetTransactionsRepository.sum.mockResolvedValue({
      amount: new Decimal(200),
      count: 1,
    });
    budgetTransactionsRepository.sumGroupByCategory.mockResolvedValue([]);
    budgetCategoriesRepository.findManyByIds.mockResolvedValue([]);
    budgetTransactionsRepository.findAllByDate.mockResolvedValue([]);

    const result = await service.getMonthlyStatistics(
      {
        id: 'account-1',
      } as never,
      6,
      2026,
      'pet-1',
    );

    expect(
      budgetTransactionsRepository.sumGroupByCategory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        pet_id: 'pet-1',
      }),
    );
    expect(budgetTransactionsRepository.findAllByDate).toHaveBeenCalledWith(
      expect.objectContaining({
        pet_id: 'pet-1',
      }),
    );
    expect(result).toMatchObject({
      pet_id: 'pet-1',
      summary: {
        total_spent: 200,
        transaction_count: 1,
      },
    });
  });
});
