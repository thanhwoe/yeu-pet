import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePetSitterDto } from './dto/create-pet-sitter.dto';
import { UpdatePetSitterDto } from './dto/update-pet-sitter.dto';
import { accounts } from '@app/generated/prisma/client';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';

export interface PetSitterSearchFilters {
  address?: string;
  city?: string;
  district?: string;
  minRating?: string;
  maxPrice?: string;
}

@Injectable()
export class PetSittersService {
  constructor(
    @Inject(IPetSittersRepository)
    private readonly petSittersRepository: IPetSittersRepository,
  ) {}

  async create(user: accounts, createPetSitterDto: CreatePetSitterDto) {
    const existing = await this.petSittersRepository.findByUser(user.id);
    if (existing) {
      throw new ConflictException('User is already registered as a pet sitter');
    }

    return this.petSittersRepository.create({
      account_id: user.id,
      display_name: createPetSitterDto.displayName,
      address: createPetSitterDto.address,
      bio: createPetSitterDto.bio,
      city: createPetSitterDto.city,
      district: createPetSitterDto.district,
      ward: createPetSitterDto.ward,
      latitude: createPetSitterDto.latitude,
      longitude: createPetSitterDto.longitude,
      experience: createPetSitterDto.experience,
      service_notes: createPetSitterDto.serviceNotes,
      daily_rate: createPetSitterDto.dailyRate,
      hourly_rate: createPetSitterDto.hourlyRate,
      max_concurrent_bookings: createPetSitterDto.maxConcurrentBookings,
    });
  }

  async findAll(
    user: accounts,
    pagination: PaginationDto,
    filters: PetSitterSearchFilters = {},
  ) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.petSittersRepository.findAll({
      skip,
      take: limit,
      address: filters.address,
      city: filters.city,
      district: filters.district,
      minRating: this.parseOptionalNumber(filters.minRating, 'minRating'),
      maxPrice: this.parseOptionalNumber(filters.maxPrice, 'maxPrice'),
      viewer_account_id: user.id,
    });

    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const sitter = await this.findExisting(id);
    return sitter;
  }

  async update(
    user: accounts,
    id: string,
    updatePetSitterDto: UpdatePetSitterDto,
  ) {
    await this.assertOwner(user, id);

    return this.petSittersRepository.update(id, {
      display_name: updatePetSitterDto.displayName,
      address: updatePetSitterDto.address,
      bio: updatePetSitterDto.bio,
      city: updatePetSitterDto.city,
      district: updatePetSitterDto.district,
      ward: updatePetSitterDto.ward,
      latitude: updatePetSitterDto.latitude,
      longitude: updatePetSitterDto.longitude,
      experience: updatePetSitterDto.experience,
      service_notes: updatePetSitterDto.serviceNotes,
      hourly_rate: updatePetSitterDto.hourlyRate,
      daily_rate: updatePetSitterDto.dailyRate,
      max_concurrent_bookings: updatePetSitterDto.maxConcurrentBookings,
      is_available: updatePetSitterDto.isAvailable,
    });
  }

  async updateMe(user: accounts, updatePetSitterDto: UpdatePetSitterDto) {
    const sitter = await this.findMe(user);

    return this.update(user, sitter.id, updatePetSitterDto);
  }

  async findMe(user: accounts) {
    const sitter = await this.petSittersRepository.findByUser(user.id);
    if (!sitter) {
      throw new NotFoundException('You are not registered as a pet sitter');
    }

    return sitter;
  }

  private async findExisting(id: string) {
    const record = await this.petSittersRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Pet sitter with ID ${id} not found`);
    }

    return record;
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.findExisting(id);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }

  private parseOptionalNumber(value: string | undefined, name: string) {
    if (value === undefined || value.trim() === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${name} must be a number`);
    }

    return parsed;
  }
}
