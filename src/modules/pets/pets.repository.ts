import { PrismaService } from '@app/database/prisma/prisma.service';
import { pets } from '@app/generated/prisma/client';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PetsRepository implements IPetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<
      pets,
      'id' | 'created_at' | 'updated_at' | 'avatar_url' | 'avatar_id'
    >,
  ) {
    return this.prisma.pets.create({
      data,
    });
  }

  async update(id: string, data: Partial<pets>) {
    return this.prisma.pets.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.pets.delete({
      where: { id },
    });
  }
  async findAll(params?: { skip?: number; take?: number; account_id: string }) {
    return this.prisma.pets.findMany({
      where: {
        account_id: params?.account_id,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.pets.findUnique({
      where: { id },
    });
  }
  findByUser(account_id: string, id: string) {
    return this.prisma.pets.findUnique({
      where: {
        account_id,
        id,
      },
    });
  }
}
