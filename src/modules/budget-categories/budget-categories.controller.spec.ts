import { Test, TestingModule } from '@nestjs/testing';
import { BudgetCategoriesController } from './budget-categories.controller';
import { BudgetCategoriesService } from './budget-categories.service';

describe('BudgetCategoriesController', () => {
  let controller: BudgetCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetCategoriesController],
      providers: [BudgetCategoriesService],
    }).compile();

    controller = module.get<BudgetCategoriesController>(
      BudgetCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
