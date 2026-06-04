import { Decimal } from '@prisma/client/runtime/client';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { Test } from '@nestjs/testing';
import { SubscriptionService } from '../../subscription/subscription.service';
import { BudgetTransactionsService } from './budget-transactions.service';

describe('BudgetTransactionsService', () => {
  const budgetTransactionsRepository = {
    create: jest.fn(),
  };
  const budgetCategoriesRepository = {
    findById: jest.fn(),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };
  const subscriptionService = {
    assertCanCreateBudgetTransaction: jest.fn(),
  };

  let service: BudgetTransactionsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        BudgetTransactionsService,
        {
          provide: IBudgetTransactionsRepository,
          useValue: budgetTransactionsRepository,
        },
        {
          provide: IBudgetCategoriesRepository,
          useValue: budgetCategoriesRepository,
        },
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compile();

    service = moduleRef.get(BudgetTransactionsService);
  });

  it('validates category, pet ownership, and entitlement before create', async () => {
    budgetCategoriesRepository.findById.mockResolvedValue({
      id: 'category-1',
      account_id: 'account-1',
    });
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    budgetTransactionsRepository.create.mockResolvedValue({
      id: 'transaction-1',
    });

    await service.create(
      {
        id: 'account-1',
      } as never,
      {
        amount: new Decimal(120000),
        categoryId: 'category-1',
        petId: 'pet-1',
        date: '2026-06-04T00:00:00.000Z',
      } as never,
    );

    expect(budgetCategoriesRepository.findById).toHaveBeenCalledWith(
      'category-1',
    );
    expect(petsRepository.findByUser).toHaveBeenCalledWith(
      'account-1',
      'pet-1',
    );
    expect(
      subscriptionService.assertCanCreateBudgetTransaction,
    ).toHaveBeenCalledWith('account-1', expect.any(Date));
    expect(budgetTransactionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: expect.any(Decimal) as Decimal,
        pets: {
          connect: {
            id: 'pet-1',
          },
        },
      }),
    );
  });
});
