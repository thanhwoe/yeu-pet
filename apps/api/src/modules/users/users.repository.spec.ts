import { sitter_bookings_status } from '@app/generated/prisma/client';
import {
  buildAccountDeletionBlockingBookingWhere,
  buildAccountDeletionExpiredPendingBookingWhere,
} from './users.repository';

describe('UsersRepository account deletion booking filters', () => {
  const now = new Date('2026-06-29T10:00:00.000Z');
  const ownershipWhere = [
    { account_id: 'account-1' },
    { sitter_id: 'sitter-1' },
  ];

  it('blocks confirmed, active, and unexpired pending bookings', () => {
    expect(
      buildAccountDeletionBlockingBookingWhere(ownershipWhere, now),
    ).toEqual({
      AND: [
        { OR: ownershipWhere },
        {
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
                { expires_at: null },
                {
                  expires_at: {
                    gt: now,
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('selects only expired pending bookings for pre-delete cancellation', () => {
    expect(
      buildAccountDeletionExpiredPendingBookingWhere(ownershipWhere, now),
    ).toEqual({
      AND: [
        { OR: ownershipWhere },
        {
          status: sitter_bookings_status.pending,
          expires_at: {
            lte: now,
          },
        },
      ],
    });
  });
});
