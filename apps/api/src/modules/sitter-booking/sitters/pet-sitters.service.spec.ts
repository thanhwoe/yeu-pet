import { Test, TestingModule } from '@nestjs/testing';
import { PetSittersService } from './pet-sitters.service';

describe('PetSittersService', () => {
  let service: PetSittersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetSittersService],
    }).compile();

    service = module.get<PetSittersService>(PetSittersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
