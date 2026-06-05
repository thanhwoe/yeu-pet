import { accounts, reports, user_blocks } from '@app/generated/prisma/client';
import { report_target_type } from '@app/generated/prisma/enums';

export const IModerationRepository = Symbol('IModerationRepository');

export type BlockWithAccount = user_blocks & {
  blocked_account: Pick<
    accounts,
    'id' | 'first_name' | 'last_name' | 'avatar_url'
  >;
};

export interface ReportTarget {
  exists: boolean;
  ownerAccountId?: string | null;
}

export interface IModerationRepository {
  createReport(params: {
    reporter_account_id: string;
    target_type: report_target_type;
    target_id: string;
    reason: string;
    description?: string;
  }): Promise<reports>;
  findReportsByUser(params: {
    reporter_account_id: string;
    skip?: number;
    take?: number;
  }): Promise<[reports[], number]>;
  findTarget(
    targetType: report_target_type,
    targetId: string,
  ): Promise<ReportTarget>;
  findActiveAccount(id: string): Promise<Pick<accounts, 'id'> | null>;
  upsertBlock(params: {
    blocker_account_id: string;
    blocked_account_id: string;
  }): Promise<BlockWithAccount>;
  deleteBlock(params: {
    blocker_account_id: string;
    blocked_account_id: string;
  }): Promise<number>;
  findBlocksByUser(params: {
    blocker_account_id: string;
    skip?: number;
    take?: number;
  }): Promise<[BlockWithAccount[], number]>;
}
