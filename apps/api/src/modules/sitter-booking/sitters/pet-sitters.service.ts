import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePetSitterDto } from './dto/create-pet-sitter.dto';
import { UpdatePetSitterDto } from './dto/update-pet-sitter.dto';
import { PetSittersRepository } from './pet-sitters.repository';
import { accounts } from '@app/generated/prisma/client';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { Action } from '../../casl/casl.types';
import { assertAbility } from '../../casl/casl.helper';

@Injectable()
export class PetSittersService {
  constructor(
    private readonly petSittersRepository: PetSittersRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
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
    const sitter = await this.assertAbility(user, id, Action.Read);
    return sitter;
  }

  async update(
    user: accounts,
    id: string,
    updatePetSitterDto: UpdatePetSitterDto,
  ) {
    await this.assertAbility(user, id, Action.Update);

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

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.petSittersRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Pet sitter with ID ${id} not found`);
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'PetSitters', record);

    return record;
  }
}
