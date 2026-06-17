import {
  PrismaClient,
  accounts,
  pet_sitters,
  pets,
  sitter_bookings,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';
import {
  sitter_bookingsCreateInput,
  sitter_bookingsUpdateInput,
} from '@app/generated/prisma/models';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

export const ISitterBookingsRepository = Symbol('ISitterBookingsRepository');

export interface SitterInformation {
  accounts: Pick<accounts, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  pets: Pick<
    pets,
    | 'id'
    | 'name'
    | 'age'
    | 'birthdate'
    | 'breed'
    | 'weight'
    | 'weight_value'
    | 'weight_unit'
    | 'color'
    | 'avatar_url'
    | 'gender'
    | 'species'
    | 'notes'
  >;
  pet_sitters: {
    id: pet_sitters['id'];
    account_id: string;
    display_name: string | null;
    bio: string | null;
    address: string;
    city: string | null;
    district: string | null;
    ward: string | null;
    experience: string | null;
    service_notes: string | null;
    hourly_rate: pet_sitters['hourly_rate'];
    daily_rate: pet_sitters['daily_rate'];
    max_concurrent_bookings: number;
    active_bookings_count: number;
    completed_bookings_count: number;
    avg_rating: pet_sitters['avg_rating'];
    total_reviews: number;
    is_available: boolean;
    is_verified: boolean;
    created_at: Date | null;
    updated_at: Date | null;
    accounts: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  };
}

export type SitterBookingWithRelations = sitter_bookings & SitterInformation;

export type ExpiredSitterBooking = sitter_bookings & {
  accounts: {
    email: string | null;
    first_name: string | null;
  };
  pets: {
    name: string;
  };
  pet_sitters: {
    accounts: {
      email: string | null;
      first_name: string | null;
      last_name: string | null;
    };
  };
};

export interface ISitterBookingsRepository {
  create(data: sitter_bookingsCreateInput): Promise<SitterBookingWithRelations>;
  createInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    data: sitter_bookingsCreateInput,
  ): Promise<SitterBookingWithRelations>;
  update(
    id: string,
    data: sitter_bookingsUpdateInput,
  ): Promise<SitterBookingWithRelations>;
  cancel(
    id: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<SitterBookingWithRelations>;
  findById(id: string): Promise<SitterBookingWithRelations | null>;
  findByIdempotencyKey(
    accountId: string,
    idempotencyKey: string,
  ): Promise<SitterBookingWithRelations | null>;
  findByIdempotencyKeyInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    accountId: string,
    idempotencyKey: string,
  ): Promise<SitterBookingWithRelations | null>;
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    status?: sitter_bookings_status;
  }): Promise<[SitterBookingWithRelations[], number]>;
  findAllBySitter(params?: {
    skip?: number;
    take?: number;
    sitter_id: string;
    status?: sitter_bookings_status;
  }): Promise<[SitterBookingWithRelations[], number]>;
  findOverlappingInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
    start_time: Date,
    end_time: Date,
    excludeId: string,
  ): Promise<sitter_bookings | null>;
  countHeldOverlappingInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
    start_time: Date,
    end_time: Date,
    now: Date,
    excludeId?: string,
  ): Promise<number>;
  confirmInTx(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    id: string,
  ): Promise<SitterBookingWithRelations>;
  runSerializable<T>(
    fn: (tx: Omit<PrismaClient, ITXClientDenyList>) => Promise<T>,
  ): Promise<T>;
  activeDue(date: Date): Promise<BatchPayload>;
  expirePending(date: Date): Promise<ExpiredSitterBooking[]>;
}
