import { Test, TestingModule } from '@nestjs/testing';
import { SitterBookingsService } from './sitter-bookings.service';

describe('SitterBookingsService', () => {
  let service: SitterBookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SitterBookingsService],
    }).compile();

    service = module.get<SitterBookingsService>(SitterBookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
