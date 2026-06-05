import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { accounts } from '@app/generated/prisma/client';
import { IModerationRepository } from '@app/interfaces/moderation-repository.interface';
import { paginate } from '@app/utils/pagination';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ModerationService {
  constructor(
    @Inject(IModerationRepository)
    private readonly moderationRepository: IModerationRepository,
  ) {}

  async createReport(user: accounts, createReportDto: CreateReportDto) {
    const target = await this.moderationRepository.findTarget(
      createReportDto.targetType,
      createReportDto.targetId,
    );

    if (!target.exists) {
      throw new NotFoundException('Report target not found');
    }

    if (target.ownerAccountId === user.id) {
      throw new BadRequestException('You cannot report your own content');
    }

    const report = await this.moderationRepository.createReport({
      reporter_account_id: user.id,
      target_type: createReportDto.targetType,
      target_id: createReportDto.targetId,
      reason: createReportDto.reason,
      description: createReportDto.description,
    });

    return {
      reported: true,
      report,
    };
  }

  async findMyReports(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.moderationRepository.findReportsByUser({
      reporter_account_id: user.id,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async blockUser(user: accounts, blockedAccountId: string) {
    if (user.id === blockedAccountId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const account =
      await this.moderationRepository.findActiveAccount(blockedAccountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const block = await this.moderationRepository.upsertBlock({
      blocker_account_id: user.id,
      blocked_account_id: blockedAccountId,
    });

    return {
      blocked: true,
      block,
    };
  }

  async unblockUser(user: accounts, blockedAccountId: string) {
    if (user.id === blockedAccountId) {
      throw new BadRequestException('You cannot unblock yourself');
    }

    await this.moderationRepository.deleteBlock({
      blocker_account_id: user.id,
      blocked_account_id: blockedAccountId,
    });

    return {
      blocked: false,
      blockedAccountId,
    };
  }

  async findMyBlocks(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.moderationRepository.findBlocksByUser({
      blocker_account_id: user.id,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }
}
