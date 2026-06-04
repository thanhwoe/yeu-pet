import { PrismaService } from '@app/database/prisma/prisma.service';
import { pet_sitters, PrismaClient } from '@app/generated/prisma/client';
import { pet_sittersWhereInput } from '@app/generated/prisma/models';
import {
  IPetSittersRepository,
  PetSittersCreate,
} from '@app/interfaces/pet-sitters-repository.interface';
import { Injectable } from '@nestjs/common';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

@Injectable()
export class PetSittersRepository implements IPetSittersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: PetSittersCreate) {
    return this.prisma.pet_sitters.create({
      data,
    });
  }
  update(id: string, data: Partial<pet_sitters>) {
    return this.prisma.pet_sitters.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  findAll(params?: {
    skip?: number;
    take?: number;
    address?: string;
    city?: string;
    district?: string;
    minRating?: number;
    maxPrice?: number;
  }) {
    const address = params?.address?.trim();
    const city = params?.city?.trim();
    const district = params?.district?.trim();

    const where: pet_sittersWhereInput = {
      is_available: true,
      ...(address
        ? { address: { contains: address, mode: 'insensitive' } }
        : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(district
        ? { district: { contains: district, mode: 'insensitive' } }
        : {}),
      ...(params?.minRating === undefined
        ? {}
        : { avg_rating: { gte: params.minRating } }),
      ...(params?.maxPrice === undefined
        ? {}
        : {
            OR: [
              { hourly_rate: { lte: params.maxPrice } },
              { daily_rate: { lte: params.maxPrice } },
            ],
          }),
    };
    return this.prisma.$transaction([
      this.prisma.pet_sitters.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: [{ avg_rating: 'desc' }, { completed_bookings_count: 'desc' }],
        include: {
          accounts: {
            select: {
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.pet_sitters.count({ where }),
    ]);
  }
  findById(id: string) {
    return this.prisma.pet_sitters.findUnique({ where: { id } });
  }
  findByUser(account_id: string) {
    return this.prisma.pet_sitters.findUnique({ where: { account_id } });
  }

  async lock(tx: Omit<PrismaClient, ITXClientDenyList>, sitter_id: string) {
    return this.prisma.lockRowForUpdate<
      Pick<
        pet_sitters,
        'id' | 'account_id' | 'is_available' | 'max_concurrent_bookings'
      >
    >(tx, {
      table: 'pet_sitters',
      id: sitter_id,
      columns: ['id', 'account_id', 'is_available', 'max_concurrent_bookings'],
    });
  }
}
