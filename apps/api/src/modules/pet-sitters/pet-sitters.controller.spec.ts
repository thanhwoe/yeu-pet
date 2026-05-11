import { Test, TestingModule } from '@nestjs/testing';
import { PetSittersController } from './pet-sitters.controller';
import { PetSittersService } from './pet-sitters.service';

describe('PetSittersController', () => {
  let controller: PetSittersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetSittersController],
      providers: [PetSittersService],
    }).compile();

    controller = module.get<PetSittersController>(PetSittersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
