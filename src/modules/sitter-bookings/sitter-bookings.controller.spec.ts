import { Test, TestingModule } from '@nestjs/testing';
import { SitterBookingsController } from './sitter-bookings.controller';
import { SitterBookingsService } from './sitter-bookings.service';

describe('SitterBookingsController', () => {
  let controller: SitterBookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitterBookingsController],
      providers: [SitterBookingsService],
    }).compile();

    controller = module.get<SitterBookingsController>(SitterBookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
