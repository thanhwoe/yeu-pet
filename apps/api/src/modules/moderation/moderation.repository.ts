import { PrismaService } from '@app/database/prisma/prisma.service';
import { report_target_type } from '@app/generated/prisma/enums';
import {
  BlockWithAccount,
  IModerationRepository,
  ReportTarget,
} from '@app/interfaces/moderation-repository.interface';
import { Injectable } from '@nestjs/common';

const BLOCKED_ACCOUNT_SELECT = {
  id: true,
  first_name: true,
  last_name: true,
  avatar_url: true,
} as const;

@Injectable()
export class ModerationRepository implements IModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createReport(params: {
    reporter_account_id: string;
    target_type: report_target_type;
    target_id: string;
    reason: string;
    description?: string;
  }) {
    return this.prisma.reports.create({
      data: params,
    });
  }

  findReportsByUser(params: {
    reporter_account_id: string;
    skip?: number;
    take?: number;
  }) {
    const where = {
      reporter_account_id: params.reporter_account_id,
    };

    return this.prisma.$transaction([
      this.prisma.reports.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.reports.count({ where }),
    ]);
  }

  async findTarget(
    targetType: report_target_type,
    targetId: string,
  ): Promise<ReportTarget> {
    switch (targetType) {
      case report_target_type.photo: {
        const photo = await this.prisma.photos.findFirst({
          where: { id: targetId, deleted_at: null },
          select: { account_id: true },
        });

        return { exists: !!photo, ownerAccountId: photo?.account_id };
      }
      case report_target_type.comment: {
        const comment = await this.prisma.photo_comments.findFirst({
          where: { id: targetId, deleted_at: null },
          select: { account_id: true },
        });

        return { exists: !!comment, ownerAccountId: comment?.account_id };
      }
      case report_target_type.sitter: {
        const sitter = await this.prisma.pet_sitters.findUnique({
          where: { id: targetId },
          select: { account_id: true },
        });

        return { exists: !!sitter, ownerAccountId: sitter?.account_id };
      }
      case report_target_type.user: {
        const account = await this.findActiveAccount(targetId);

        return { exists: !!account, ownerAccountId: account?.id };
      }
    }
  }

  findActiveAccount(id: string) {
    return this.prisma.accounts.findFirst({
      where: { id, is_active: true },
      select: { id: true },
    });
  }

  upsertBlock(params: {
    blocker_account_id: string;
    blocked_account_id: string;
  }): Promise<BlockWithAccount> {
    return this.prisma.user_blocks.upsert({
      where: {
        blocker_account_id_blocked_account_id: params,
      },
      create: params,
      update: {},
      include: {
        blocked_account: {
          select: BLOCKED_ACCOUNT_SELECT,
        },
      },
    });
  }

  async deleteBlock(params: {
    blocker_account_id: string;
    blocked_account_id: string;
  }) {
    const result = await this.prisma.user_blocks.deleteMany({
      where: params,
    });

    return result.count;
  }

  findBlocksByUser(params: {
    blocker_account_id: string;
    skip?: number;
    take?: number;
  }): Promise<[BlockWithAccount[], number]> {
    const where = {
      blocker_account_id: params.blocker_account_id,
    };

    return this.prisma.$transaction([
      this.prisma.user_blocks.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
        include: {
          blocked_account: {
            select: BLOCKED_ACCOUNT_SELECT,
          },
        },
      }),
      this.prisma.user_blocks.count({ where }),
    ]);
  }
}
