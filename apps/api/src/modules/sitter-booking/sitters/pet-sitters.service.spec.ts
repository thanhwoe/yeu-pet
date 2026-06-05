import { Decimal } from '@prisma/client/runtime/client';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { PetSittersService } from './pet-sitters.service';

describe('PetSittersService', () => {
  const petSittersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
  };

  let service: PetSittersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PetSittersService,
        {
          provide: IPetSittersRepository,
          useValue: petSittersRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(PetSittersService);
  });

  it('creates one sitter profile per account with structured profile fields', async () => {
    petSittersRepository.findByUser.mockResolvedValue(null);
    petSittersRepository.create.mockResolvedValue({ id: 'sitter-1' });

    await service.create({ id: 'account-1' } as never, {
      address: '123 Le Loi',
      bio: 'Gentle sitter',
      city: 'Ho Chi Minh City',
      dailyRate: new Decimal(500000),
      district: 'District 1',
      displayName: 'Yeu Sitter',
      experience: '3 years',
      hourlyRate: new Decimal(80000),
      maxConcurrentBookings: 2,
      serviceNotes: 'Small pets preferred',
      ward: 'Ben Nghe',
    });

    expect(petSittersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'account-1',
        city: 'Ho Chi Minh City',
        district: 'District 1',
        display_name: 'Yeu Sitter',
        max_concurrent_bookings: 2,
        service_notes: 'Small pets preferred',
      }),
    );
  });

  it('rejects duplicate sitter profiles for an account', async () => {
    petSittersRepository.findByUser.mockResolvedValue({ id: 'sitter-1' });

    await expect(
      service.create({ id: 'account-1' } as never, {
        address: '123 Le Loi',
        dailyRate: new Decimal(500000),
        hourlyRate: new Decimal(80000),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('passes structured search filters to the repository', async () => {
    petSittersRepository.findAll.mockResolvedValue([[], 0]);

    await service.findAll(
      { id: 'account-1' } as never,
      { page: 1, limit: 20 },
      {
        city: 'Ho Chi Minh City',
        district: 'District 1',
        maxPrice: '100000',
        minRating: '4.5',
      },
    );

    expect(petSittersRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      address: undefined,
      city: 'Ho Chi Minh City',
      district: 'District 1',
      maxPrice: 100000,
      minRating: 4.5,
      viewer_account_id: 'account-1',
    });
  });

  it('rejects invalid numeric search filters', async () => {
    await expect(
      service.findAll(
        { id: 'account-1' } as never,
        { page: 1, limit: 10 },
        { minRating: 'great' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates the current user sitter profile', async () => {
    petSittersRepository.findByUser.mockResolvedValue({
      id: 'sitter-1',
      account_id: 'account-1',
    });
    petSittersRepository.findById.mockResolvedValue({
      id: 'sitter-1',
      account_id: 'account-1',
    });
    petSittersRepository.update.mockResolvedValue({ id: 'sitter-1' });

    await service.updateMe({ id: 'account-1' } as never, {
      city: 'Da Nang',
      isAvailable: false,
    });

    expect(petSittersRepository.update).toHaveBeenCalledWith(
      'sitter-1',
      expect.objectContaining({
        city: 'Da Nang',
        is_available: false,
      }),
    );
  });
});
