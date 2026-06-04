import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { weight_unit } from '@app/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { Test } from '@nestjs/testing';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  const petsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
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

  it('checks entitlement and stores numeric weight before creating a pet', async () => {
    petsRepository.create.mockResolvedValue({ id: 'pet-1' });

    await service.create('account-1', {
      name: 'Miu',
      weight: '4.2 kg',
      weightValue: new Decimal(4.2),
      weightUnit: weight_unit.kg,
    } as never);

    expect(subscriptionService.assertCanCreatePet).toHaveBeenCalledWith(
      'account-1',
    );
    expect(petsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'account-1',
        name: 'Miu',
        weight: '4.2 kg',
        weight_value: expect.any(Decimal) as Decimal,
        weight_unit: weight_unit.kg,
      }),
    );
  });

  it('updates numeric weight without clearing avatar url', async () => {
    petsRepository.findById.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
      avatar_url: 'https://example.com/avatar.png',
    });
    let updatePayload: Record<string, unknown> | undefined;
    petsRepository.update.mockImplementation((_: string, data: unknown) => {
      updatePayload = data as Record<string, unknown>;
      return Promise.resolve({ id: 'pet-1' });
    });

    await service.update(
      {
        id: 'account-1',
      } as never,
      'pet-1',
      {
        weightValue: new Decimal(8),
        weightUnit: weight_unit.lb,
      },
    );

    expect(petsRepository.update).toHaveBeenCalledWith(
      'pet-1',
      expect.objectContaining({
        weight_value: expect.any(Decimal) as Decimal,
        weight_unit: weight_unit.lb,
      }),
    );
    expect(updatePayload).not.toHaveProperty('avatar_url');
  });
});
