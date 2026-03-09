import { PrismaService } from '@app/database/prisma/prisma.service';
import { pet_sitters } from '@app/generated/prisma/client';
import { pet_sittersWhereInput } from '@app/generated/prisma/models';
import {
  IPetSittersRepository,
  PetSittersCreate,
} from '@app/interfaces/pet-sitters-repository.interface';
import { Injectable } from '@nestjs/common';

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
  findAll(params?: { skip?: number; take?: number; address?: string }) {
    const where: pet_sittersWhereInput = {
      is_available: true,
      address: {
        contains: params?.address?.trim(),
        mode: 'insensitive',
      },
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
}
