import { Test, TestingModule } from '@nestjs/testing';
import { SitterReviewsController } from './sitter-reviews.controller';
import { SitterReviewsService } from './sitter-reviews.service';

describe('SitterReviewsController', () => {
  let controller: SitterReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitterReviewsController],
      providers: [SitterReviewsService],
    }).compile();

    controller = module.get<SitterReviewsController>(SitterReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
