import { Test, TestingModule } from '@nestjs/testing';
import { SitterReviewsService } from './sitter-reviews.service';

describe('SitterReviewsService', () => {
  let service: SitterReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SitterReviewsService],
    }).compile();

    service = module.get<SitterReviewsService>(SitterReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
