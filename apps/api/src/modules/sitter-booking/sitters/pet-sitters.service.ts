import {
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
      address: createPetSitterDto.address,
      bio: createPetSitterDto.bio,
      daily_rate: createPetSitterDto.dailyRate,
      hourly_rate: createPetSitterDto.hourlyRate,
    });
  }

  async findAll(pagination: PaginationDto, address?: string) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.petSittersRepository.findAll({
      skip,
      take: limit,
      address,
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
      address: updatePetSitterDto.address,
      bio: updatePetSitterDto.bio,
      hourly_rate: updatePetSitterDto.hourlyRate,
      daily_rate: updatePetSitterDto.dailyRate,
      is_available: updatePetSitterDto.isAvailable,
    });
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
}
