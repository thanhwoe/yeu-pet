import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  PrismaClient,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import {
  sitter_bookingsCreateInput,
  sitter_bookingsUpdateInput,
  sitter_bookingsWhereInput,
} from '@app/generated/prisma/models';
import { ISitterBookingsRepository } from '@app/interfaces/sitter-bookings-repository.interface';
import { Injectable } from '@nestjs/common';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

@Injectable()
export class SitterBookingsRepository implements ISitterBookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: sitter_bookingsCreateInput) {
    return this.prisma.sitter_bookings.create({
      data,
    });
  }
  createInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    data: sitter_bookingsCreateInput,
  ) {
    return tx.sitter_bookings.create({
      data,
    });
  }
  update(id: string, data: sitter_bookingsUpdateInput) {
    return this.prisma.sitter_bookings.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
      include: this.include(),
    });
  }
  cancel(id: string, cancelledBy: string, reason?: string) {
    return this.prisma.sitter_bookings.update({
      where: { id },
      data: {
        status: sitter_bookings_status.cancelled,
        cancel_reason: reason,
        cancelled_at: new Date(),
        cancelled_by: cancelledBy,
        updated_at: new Date(),
      },
    });
  }

  findByIdempotencyKey(accountId: string, idempotencyKey: string) {
    return this.prisma.sitter_bookings.findFirst({
      where: {
        account_id: accountId,
        idempotency_key: idempotencyKey,
      },
    });
  }

  findByIdempotencyKeyInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    accountId: string,
    idempotencyKey: string,
  ) {
    return tx.sitter_bookings.findFirst({
      where: {
        account_id: accountId,
        idempotency_key: idempotencyKey,
      },
    });
  }

  findOverlappingInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
    start_time: Date,
    end_time: Date,
    excludeId: string,
  ) {
    return tx.sitter_bookings.findFirst({
      where: {
        id: { not: excludeId },
        sitter_id,
        start_time: {
          lt: end_time,
        },
        end_time: {
          gt: start_time,
        },
        status: {
          in: [sitter_bookings_status.confirmed, sitter_bookings_status.active],
        },
      },
    });
  }

  countHeldOverlappingInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
    start_time: Date,
    end_time: Date,
    now: Date,
    excludeId?: string,
  ) {
    return tx.sitter_bookings.count({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        sitter_id,
        start_time: {
          lt: end_time,
        },
        end_time: {
          gt: start_time,
        },
        OR: [
          {
            status: {
              in: [
                sitter_bookings_status.confirmed,
                sitter_bookings_status.active,
              ],
            },
          },
          {
            status: sitter_bookings_status.pending,
            OR: [
              {
                expires_at: null,
              },
              {
                expires_at: {
                  gt: now,
                },
              },
            ],
          },
        ],
      },
    });
  }

  confirmInTx(tx: Omit<PrismaClient, ITXClientDenyList>, id: string) {
    const now = new Date();

    return tx.sitter_bookings.update({
      where: { id },
      data: {
        status: sitter_bookings_status.confirmed,
        confirmed_at: now,
        expires_at: null,
        updated_at: now,
      },
    });
  }

  runSerializable<T>(
    fn: (tx: Omit<PrismaClient, ITXClientDenyList>) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(fn, {
      isolationLevel: 'Serializable',
      timeout: 5000,
    });
  }
  findAllBySitter(params?: {
    skip?: number;
    take?: number;
    sitter_id: string;
    status?: sitter_bookings_status;
  }) {
    const where: sitter_bookingsWhereInput = {
      sitter_id: params?.sitter_id,
      status: params?.status,
    };
    return this.prisma.$transaction([
      this.prisma.sitter_bookings.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.sitter_bookings.count({ where }),
    ]);
  }
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    status?: sitter_bookings_status;
  }) {
    const where: sitter_bookingsWhereInput = {
      account_id: params?.account_id,
      status: params?.status,
    };
    return this.prisma.$transaction([
      this.prisma.sitter_bookings.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.sitter_bookings.count({ where }),
    ]);
  }
  findById(id: string) {
    return this.prisma.sitter_bookings.findUnique({
      where: { id },
      include: this.include(),
    });
  }

  activeDue(date: Date) {
    return this.prisma.sitter_bookings.updateMany({
      where: {
        status: sitter_bookings_status.confirmed,
        start_time: {
          lte: date,
        },
      },
      data: {
        status: sitter_bookings_status.active,
        updated_at: new Date(),
      },
    });
  }

  private include() {
    return {
      pet_sitters: {
        select: {
          account_id: true,
          accounts: {
            select: {
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
        },
      },
    };
  }
}
