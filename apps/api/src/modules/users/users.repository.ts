import { Injectable, Logger } from '@nestjs/common';
import {
  accounts,
  sitter_bookings_status,
  subscription_status,
  subscription_tier,
} from '@app/generated/prisma/client';
import {
  AccountDeletionFiles,
  AccountDeletionResult,
  IUsersRepository,
} from '@app/interfaces/users-repository.interface';
import { PrismaService } from '@app/database/prisma/prisma.service';

export const ACCOUNT_PUBLIC_SELECT = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  onboarding_completed: true,
  avatar_url: true,
  role: true,
  subscription: true,
  subscription_expires_at: true,
  is_active: true,
  is_verified: true,
} as const;

const ACTIVE_BOOKING_STATUSES = [
  sitter_bookings_status.pending,
  sitter_bookings_status.confirmed,
  sitter_bookings_status.active,
];

const DELETED_ACCOUNT_FIRST_NAME = 'Deleted';
const DELETED_ACCOUNT_LAST_NAME = 'User';
const DELETED_PET_NAME = 'Deleted pet';
const DELETED_SITTER_VALUE = 'Deleted account';
const DELETED_COMMENT_CONTENT = '[deleted]';

export class AccountDeletionBlockedByActiveBookingsError extends Error {
  constructor(readonly activeBookingCount: number) {
    super('Account has active sitter bookings');
    this.name = AccountDeletionBlockedByActiveBookingsError.name;
  }
}

const uniqueStrings = (values: Array<string | null | undefined>) => [
  ...new Set(values.filter((value): value is string => Boolean(value))),
];

const deletedEmailFor = (accountId: string) =>
  `deleted-${accountId}@yeupet.invalid`;

const deletedPhoneFor = (accountId: string) =>
  `deleted-${accountId.replace(/-/g, '').slice(0, 12)}`;

@Injectable()
export class UsersRepository implements IUsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.accounts.findUnique({
      where: { id },
      select: ACCOUNT_PUBLIC_SELECT,
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    return this.prisma.accounts.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async findAccount(id: string) {
    return this.prisma.accounts.findUnique({
      where: { id },
      omit: {
        password_hash: false,
      },
    });
  }

  async create(
    data: Pick<
      accounts,
      'phone' | 'password_hash' | 'first_name' | 'last_name' | 'email'
    >,
  ): Promise<accounts> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.accounts.create({ data });

      await tx.account_settings.create({
        data: {
          account_id: user.id,
        },
      });
      return user;
    });
  }

  async update(id: string, data: Partial<accounts>) {
    return this.prisma.accounts.update({
      where: { id },
      select: ACCOUNT_PUBLIC_SELECT,
      data,
    });
  }

  async delete(id: string): Promise<accounts> {
    // Soft delete
    return this.prisma.accounts.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async deleteAccountData(
    id: string,
    params: { passwordHash: string },
  ): Promise<AccountDeletionResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const now = new Date();
        const deletedEmail = deletedEmailFor(id);
        const deletedPhone = deletedPhoneFor(id);
        const files: AccountDeletionFiles = {
          medicalRecordIds: [],
          notificationImageIds: [],
          petAvatarIds: [],
          photoIds: [],
          userAvatarIds: [],
        };

        const account = await tx.accounts.findUnique({
          where: { id },
          select: {
            avatar_id: true,
            id: true,
            is_active: true,
          },
        });

        if (!account) {
          return { files };
        }

        files.userAvatarIds = uniqueStrings([account.avatar_id]);

        const sitter = await tx.pet_sitters.findUnique({
          where: { account_id: id },
          select: { id: true },
        });

        const bookingOwnershipWhere = sitter
          ? [{ account_id: id }, { sitter_id: sitter.id }]
          : [{ account_id: id }];
        const activeBookingCount = await tx.sitter_bookings.count({
          where: {
            OR: bookingOwnershipWhere,
            status: {
              in: ACTIVE_BOOKING_STATUSES,
            },
          },
        });

        if (activeBookingCount > 0) {
          throw new AccountDeletionBlockedByActiveBookingsError(
            activeBookingCount,
          );
        }

        const pets = await tx.pets.findMany({
          where: { account_id: id },
          select: { avatar_id: true, id: true },
        });
        const petIds = pets.map((pet) => pet.id);
        files.petAvatarIds = uniqueStrings(pets.map((pet) => pet.avatar_id));

        const medicalAttachments =
          petIds.length > 0
            ? await tx.medical_attachments.findMany({
                where: {
                  medical_records: {
                    pet_id: {
                      in: petIds,
                    },
                  },
                },
                select: { file_id: true },
              })
            : [];
        files.medicalRecordIds = uniqueStrings(
          medicalAttachments.map((attachment) => attachment.file_id),
        );

        const photos = await tx.photos.findMany({
          where: { account_id: id },
          select: { file_id: true, id: true },
        });
        const userPhotoIds = photos.map((photo) => photo.id);
        files.photoIds = uniqueStrings(photos.map((photo) => photo.file_id));

        const notifications = await tx.notifications.findMany({
          where: { account_id: id },
          select: { image_id: true },
        });
        files.notificationImageIds = uniqueStrings(
          notifications.map((notification) => notification.image_id),
        );

        const commentRows = await tx.photo_comments.findMany({
          where: {
            OR: [
              { account_id: id },
              ...(userPhotoIds.length > 0
                ? [{ photo_id: { in: userPhotoIds } }]
                : []),
            ],
            deleted_at: null,
          },
          select: { id: true, parent_id: true, photo_id: true },
        });
        const affectedCommentPhotoIds = uniqueStrings(
          commentRows.map((comment) => comment.photo_id),
        );
        const affectedParentCommentIds = uniqueStrings(
          commentRows.map((comment) => comment.parent_id),
        );

        const likedPhotoRows = await tx.photo_likes.findMany({
          where: {
            OR: [
              { account_id: id },
              ...(userPhotoIds.length > 0
                ? [{ photo_id: { in: userPhotoIds } }]
                : []),
            ],
          },
          select: { photo_id: true },
        });
        const affectedLikePhotoIds = uniqueStrings(
          likedPhotoRows.map((like) => like.photo_id),
        );
        const affectedPhotoIds = uniqueStrings([
          ...userPhotoIds,
          ...affectedCommentPhotoIds,
          ...affectedLikePhotoIds,
        ]);

        await tx.refresh_tokens.deleteMany({ where: { account_id: id } });
        await tx.otp_tokens.deleteMany({ where: { account_id: id } });
        await tx.email_change_requests.deleteMany({
          where: { account_id: id },
        });
        await tx.notification_deliveries.deleteMany({
          where: { account_id: id },
        });
        await tx.notifications.deleteMany({ where: { account_id: id } });
        await tx.account_devices.deleteMany({ where: { account_id: id } });
        await tx.account_settings.updateMany({
          where: { account_id: id },
          data: {
            ai_notifications: false,
            booking_notifications: false,
            notification_enable: false,
            reminder_notifications: false,
            social_notifications: false,
            updated_at: now,
          },
        });

        await tx.user_subscriptions.updateMany({
          where: { account_id: id },
          data: {
            cancelled_at: now,
            expires_at: now,
            provider_customer_id: null,
            provider_original_id: null,
            status: subscription_status.cancelled,
            updated_at: now,
          },
        });
        await tx.usage_counters.deleteMany({ where: { account_id: id } });

        await tx.ai_usage_logs.deleteMany({ where: { account_id: id } });
        await tx.ai_messages.deleteMany({ where: { account_id: id } });
        await tx.ai_conversations.deleteMany({ where: { account_id: id } });

        await tx.budget_transactions.deleteMany({ where: { account_id: id } });
        await tx.budgets.deleteMany({ where: { account_id: id } });
        await tx.budget_categories.deleteMany({ where: { account_id: id } });

        if (petIds.length > 0) {
          await tx.medical_records.deleteMany({
            where: { pet_id: { in: petIds } },
          });
        }

        await tx.reminders.deleteMany({ where: { account_id: id } });

        await tx.photo_likes.deleteMany({
          where: {
            OR: [
              { account_id: id },
              ...(userPhotoIds.length > 0
                ? [{ photo_id: { in: userPhotoIds } }]
                : []),
            ],
          },
        });
        await tx.photo_views.deleteMany({
          where: {
            OR: [
              { account_id: id },
              ...(userPhotoIds.length > 0
                ? [{ photo_id: { in: userPhotoIds } }]
                : []),
            ],
          },
        });
        await tx.photo_comments.updateMany({
          where: {
            OR: [
              { account_id: id },
              ...(userPhotoIds.length > 0
                ? [{ photo_id: { in: userPhotoIds } }]
                : []),
            ],
            deleted_at: null,
          },
          data: {
            content: DELETED_COMMENT_CONTENT,
            deleted_at: now,
            updated_at: now,
          },
        });
        await tx.photos.updateMany({
          where: {
            account_id: id,
            deleted_at: null,
          },
          data: {
            caption: null,
            deleted_at: now,
            file_id: null,
            is_private: true,
            thumbnail_url: null,
            updated_at: now,
            url: null,
          },
        });

        for (const parentId of affectedParentCommentIds) {
          const replyCount = await tx.photo_comments.count({
            where: {
              parent_id: parentId,
              deleted_at: null,
            },
          });

          await tx.photo_comments.updateMany({
            where: { id: parentId },
            data: {
              reply_count: replyCount,
              updated_at: now,
            },
          });
        }

        for (const photoId of affectedPhotoIds) {
          const [commentCount, likeCount] = await Promise.all([
            tx.photo_comments.count({
              where: { photo_id: photoId, deleted_at: null },
            }),
            tx.photo_likes.count({ where: { photo_id: photoId } }),
          ]);

          await tx.photos.updateMany({
            where: { id: photoId },
            data: {
              comment_count: commentCount,
              like_count: likeCount,
              updated_at: now,
            },
          });
        }

        await tx.reports.deleteMany({
          where: { reporter_account_id: id },
        });
        await tx.user_blocks.deleteMany({
          where: {
            OR: [{ blocker_account_id: id }, { blocked_account_id: id }],
          },
        });
        await tx.sitter_booking_messages.deleteMany({
          where: { sender_id: id },
        });

        await tx.sitter_reviews.updateMany({
          where: {
            OR: [
              { account_id: id },
              ...(sitter ? [{ sitter_id: sitter.id }] : []),
            ],
          },
          data: {
            comment: null,
            updated_at: now,
          },
        });

        await tx.sitter_bookings.updateMany({
          where: {
            OR: bookingOwnershipWhere,
          },
          data: {
            cancel_reason: null,
            cancelled_by: null,
            care_instructions: null,
            idempotency_key: null,
            owner_notes: null,
            payment_note: null,
            sitter_notes: null,
            updated_at: now,
          },
        });

        if (sitter) {
          await tx.pet_sitters.update({
            where: { id: sitter.id },
            data: {
              address: DELETED_SITTER_VALUE,
              bio: null,
              city: null,
              display_name: DELETED_SITTER_VALUE,
              district: null,
              experience: null,
              is_available: false,
              is_verified: false,
              latitude: null,
              longitude: null,
              service_notes: null,
              updated_at: now,
              ward: null,
            },
          });
        }

        await tx.pets.updateMany({
          where: { account_id: id },
          data: {
            age: null,
            avatar_id: null,
            avatar_url: null,
            birthdate: null,
            breed: null,
            color: null,
            deleted_at: now,
            gender: 'unknown',
            name: DELETED_PET_NAME,
            notes: null,
            species: 'other',
            updated_at: now,
            weight: null,
            weight_unit: null,
            weight_value: null,
          },
        });

        await tx.email_logs.updateMany({
          where: { account_id: id },
          data: {
            account_id: null,
            to_email: deletedEmail,
            updated_at: now,
          },
        });

        await tx.accounts.update({
          where: { id },
          data: {
            avatar_id: null,
            avatar_url: null,
            email: deletedEmail,
            first_name: DELETED_ACCOUNT_FIRST_NAME,
            is_active: false,
            is_verified: false,
            last_name: DELETED_ACCOUNT_LAST_NAME,
            onboarding_completed: false,
            password_hash: params.passwordHash,
            phone: deletedPhone,
            subscription: subscription_tier.free,
            subscription_expires_at: null,
            updated_at: now,
          },
        });

        return { files };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      },
    );
  }

  async findByEmail(email: string): Promise<accounts | null> {
    if (!email) return null;

    return this.prisma.accounts.findUnique({
      where: { email: email.toLowerCase() },
      omit: {
        password_hash: false,
      },
    });
  }

  async findByPhone(phone: string): Promise<accounts | null> {
    if (!phone) return null;

    return this.prisma.accounts.findUnique({
      where: { phone },
      omit: {
        password_hash: false,
      },
    });
  }

  async findByEmailOrPhone(identifier: string): Promise<accounts | null> {
    // Check if identifier is email (contains @)
    const isEmail = identifier.includes('@');

    if (isEmail) {
      return this.findByEmail(identifier);
    }

    return this.findByPhone(identifier);
  }

  async existsByEmail(email: string): Promise<boolean> {
    if (!email) return false;

    const count = await this.prisma.accounts.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    if (!phone) return false;

    const count = await this.prisma.accounts.count({
      where: { phone },
    });

    return count > 0;
  }
}
