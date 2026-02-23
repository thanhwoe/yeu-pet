import { PrismaService } from '@app/database/prisma/prisma.service';
import { medical_records } from '@app/generated/prisma/client';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class MedicalRecordsRepository implements IMedicalRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<
      medical_records,
      'id' | 'created_at' | 'updated_at' | 'attachments'
    >,
  ) {
    return this.prisma.medical_records.create({
      data,
      include: {
        medical_attachments: {
          where: { deleted_at: null },
        },
      },
    });
  }

  async update(
    id: string,
    data: Omit<Partial<medical_records>, 'pet_id' | 'id'>,
  ) {
    const updateData: Record<string, unknown> = { ...data };

    return this.prisma.medical_records.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...updateData,
      },
      include: {
        medical_attachments: {
          where: { deleted_at: null },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.medical_records.delete({
      where: { id },
      include: {
        medical_attachments: true,
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number; pet_id: string }) {
    return this.prisma.medical_records.findMany({
      where: {
        pet_id: params?.pet_id,
      },
      include: {
        medical_attachments: {
          where: { deleted_at: null },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.medical_records.findUnique({
      where: { id },
      include: {
        medical_attachments: {
          where: { deleted_at: null },
        },
      },
    });
  }

  async createAttachments(
    data: { medical_id: string; public_id: string; url: string }[],
  ) {
    return this.prisma.medical_attachments.createMany({
      data,
    });
  }

  async deleteAttachments(ids: string[]) {
    return this.prisma.medical_attachments.updateMany({
      data: { deleted_at: new Date(), updated_at: new Date() },
      where: {
        id: { in: ids },
      },
    });
  }

  async findDeletedAttachments() {
    return this.prisma.medical_attachments.findMany({
      where: {
        deleted_at: {
          lte: dayjs().subtract(10, 'day').toDate(),
          not: null,
        },
      },
    });
  }

  async destroyAttachments(ids: string[]) {
    return this.prisma.medical_attachments.deleteMany({
      where: {
        public_id: {
          in: ids,
        },
      },
    });
  }
}
