import { Test, TestingModule } from '@nestjs/testing';
import { BudgetTransactionsService } from './budget-transactions.service';

describe('BudgetTransactionsService', () => {
  let service: BudgetTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetTransactionsService],
    }).compile();

    service = module.get<BudgetTransactionsService>(BudgetTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
