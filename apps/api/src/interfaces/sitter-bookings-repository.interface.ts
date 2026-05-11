import {
  PrismaClient,
  sitter_bookings,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';
import {
  sitter_bookingsCreateInput,
  sitter_bookingsUpdateInput,
} from '@app/generated/prisma/models';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

interface SitterInformation {
  pet_sitters: {
    account_id: string;
    accounts: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  };
}

export interface ISitterBookingsRepository {
  create(data: sitter_bookingsCreateInput): Promise<sitter_bookings>;
  update(
    id: string,
    data: sitter_bookingsUpdateInput,
  ): Promise<sitter_bookings & SitterInformation>;
  cancel(
    id: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<sitter_bookings>;
  findById(id: string): Promise<(sitter_bookings & SitterInformation) | null>;
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    status?: sitter_bookings_status;
  }): Promise<[sitter_bookings[], number]>;
  findAllBySitter(params?: {
    skip?: number;
    take?: number;
    sitter_id: string;
    status?: sitter_bookings_status;
  }): Promise<[sitter_bookings[], number]>;
  findOverlappingInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
    start_time: Date,
    end_time: Date,
    excludeId: string,
  ): Promise<sitter_bookings | null>;
  confirmInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    id: string,
  ): Promise<sitter_bookings>;
  runSerializable<T>(
    fn: (tx: Omit<PrismaClient, ITXClientDenyList>) => Promise<T>,
  ): Promise<T>;
  activeDue(date: Date): Promise<BatchPayload>;
}
