import { Test, TestingModule } from '@nestjs/testing';
import { BudgetCategoriesService } from './budget-categories.service';

describe('BudgetCategoriesService', () => {
  let service: BudgetCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetCategoriesService],
    }).compile();

    service = module.get<BudgetCategoriesService>(BudgetCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
