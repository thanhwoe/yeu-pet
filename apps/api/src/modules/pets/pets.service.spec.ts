import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { Test } from '@nestjs/testing';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  const petsRepository = {
    create: jest.fn(),
  };
  const fileUploadService = {
    addUploadJob: jest.fn(),
  };
  const subscriptionService = {
    assertCanCreatePet: jest.fn(),
  };

  let service: PetsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: FileUploadService, useValue: fileUploadService },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compile();

    service = moduleRef.get(PetsService);
  });

  it('checks entitlement before creating a pet', async () => {
    petsRepository.create.mockResolvedValue({ id: 'pet-1' });

    await service.create('account-1', {
      name: 'Miu',
    } as never);

    expect(subscriptionService.assertCanCreatePet).toHaveBeenCalledWith(
      'account-1',
    );
    expect(petsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'account-1',
        name: 'Miu',
      }),
    );
  });
});
