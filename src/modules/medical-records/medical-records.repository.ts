import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  attachment_status,
  medical_records,
} from '@app/generated/prisma/client';
import {
  medical_recordsUpdateInput,
  medical_recordsWhereInput,
} from '@app/generated/prisma/models';
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
    });
  }

  async update(id: string, data: medical_recordsUpdateInput) {
    const updateData: Record<string, unknown> = { ...data };

    return this.prisma.medical_records.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...updateData,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.medical_records.delete({
      where: { id },
    });
  }

  async findAll(params?: { skip?: number; take?: number; pet_id: string }) {
    const where: medical_recordsWhereInput = {
      pet_id: params?.pet_id,
    };

    return this.prisma.$transaction([
      this.prisma.medical_records.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.medical_records.count({ where }),
    ]);
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
    data: {
      medical_id: string;
      file_id: string;
      url: string;
      thumbnail_url: string;
    }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const attachments = await tx.medical_attachments.createMany({
        data,
      });

      await tx.medical_records.update({
        where: { id: data[0].medical_id },
        data: {
          attachment_status: attachment_status.ready,
          updated_at: new Date(),
        },
      });
      return attachments;
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
        file_id: {
          in: ids,
        },
      },
    });
  }
}
