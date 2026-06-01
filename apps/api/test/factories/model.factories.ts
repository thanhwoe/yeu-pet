import {
  type accounts,
  type budgets,
  gender_enum,
  type pet_sitters,
  type pets,
  photos_status,
  type photos,
  reminder_status,
  reminder_type,
  type reminders,
  sitter_bookings_status,
  sitter_bookings_type,
  type sitter_bookings,
  species_enum,
  subscription_tier,
  user_role,
} from '@app/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

const now = new Date('2026-01-01T00:00:00.000Z');

const build = <T>(base: T, overrides: Partial<T> = {}): T => ({
  ...base,
  ...overrides,
});

export const createUser = (overrides: Partial<accounts> = {}): accounts =>
  build<accounts>(
    {
      id: 'user-1',
      email: 'user@example.com',
      first_name: 'Test',
      last_name: 'User',
      password_hash: 'hashed-password',
      phone: '+840000000001',
      avatar_url: null,
      role: user_role.user,
      onboarding_completed: true,
      subscription: subscription_tier.free,
      subscription_expires_at: null,
      last_sign_in_at: null,
      created_at: now,
      updated_at: now,
      is_active: true,
      is_verified: true,
      avatar_id: null,
    },
    overrides,
  );

export const createPet = (overrides: Partial<pets> = {}): pets =>
  build<pets>(
    {
      id: 'pet-1',
      account_id: 'user-1',
      name: 'Milo',
      age: 3,
      birthdate: null,
      breed: 'Mixed',
      weight: '5kg',
      color: 'Brown',
      avatar_url: null,
      gender: gender_enum.unknown,
      species: species_enum.cat,
      notes: null,
      created_at: now,
      updated_at: now,
      avatar_id: null,
    },
    overrides,
  );

export const createSitter = (
  overrides: Partial<pet_sitters> = {},
): pet_sitters =>
  build<pet_sitters>(
    {
      id: 'sitter-1',
      account_id: 'sitter-user-1',
      bio: 'Experienced sitter',
      address: '123 Test Street',
      hourly_rate: new Decimal('10.00'),
      daily_rate: new Decimal('80.00'),
      max_concurrent_bookings: 3,
      active_bookings_count: 0,
      completed_bookings_count: 0,
      avg_rating: new Decimal('0.00'),
      total_reviews: 0,
      is_available: true,
      created_at: now,
      updated_at: now,
    },
    overrides,
  );

export const createSitterBooking = (
  overrides: Partial<sitter_bookings> = {},
): sitter_bookings =>
  build<sitter_bookings>(
    {
      id: 'booking-1',
      account_id: 'user-1',
      sitter_id: 'sitter-1',
      pet_id: 'pet-1',
      type: sitter_bookings_type.hourly,
      status: sitter_bookings_status.pending,
      start_time: new Date('2026-01-02T10:00:00.000Z'),
      end_time: new Date('2026-01-02T12:00:00.000Z'),
      total_price: new Decimal('20.00'),
      cancelled_by: null,
      cancelled_at: null,
      cancel_reason: null,
      created_at: now,
      updated_at: now,
    },
    overrides,
  );

export const createBudget = (overrides: Partial<budgets> = {}): budgets =>
  build<budgets>(
    {
      id: 'budget-1',
      account_id: 'user-1',
      amount: new Decimal('500.00'),
      month: 1,
      year: 2026,
      created_at: now,
      updated_at: now,
    },
    overrides,
  );

export const createPhoto = (overrides: Partial<photos> = {}): photos =>
  build<photos>(
    {
      id: 'photo-1',
      account_id: 'user-1',
      url: 'https://example.com/photo.jpg',
      file_id: 'file-1',
      thumbnail_url: null,
      caption: 'Test photo',
      is_private: false,
      status: photos_status.ready,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      created_at: now,
      updated_at: now,
    },
    overrides,
  );

export const createReminder = (overrides: Partial<reminders> = {}): reminders =>
  build<reminders>(
    {
      id: 'reminder-1',
      account_id: 'user-1',
      pet_id: 'pet-1',
      title: 'Medication',
      description: null,
      type: reminder_type.medication,
      status: reminder_status.pending,
      scheduled_at: new Date('2026-01-03T09:00:00.000Z'),
      created_at: now,
      updated_at: now,
    },
    overrides,
  );
