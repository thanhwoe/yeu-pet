import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  email_change_requests,
  email_change_status,
} from '@app/generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { ACCOUNT_PUBLIC_SELECT } from './users.repository';

interface CreateEmailChangeRequestInput {
  accountId: string;
  newEmail: string;
  otpHash: string;
  expiresAt: Date;
  lastSentAt: Date;
}

@Injectable()
export class EmailChangeRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  cancelPendingForAccount(accountId: string, excludeId?: string) {
    return this.prisma.email_change_requests.updateMany({
      where: {
        account_id: accountId,
        status: email_change_status.pending,
        id: excludeId ? { not: excludeId } : undefined,
      },
      data: {
        status: email_change_status.cancelled,
        cancelled_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  create(input: CreateEmailChangeRequestInput) {
    return this.prisma.email_change_requests.create({
      data: {
        account_id: input.accountId,
        new_email: input.newEmail,
        otp_hash: input.otpHash,
        expires_at: input.expiresAt,
        last_sent_at: input.lastSentAt,
      },
    });
  }

  findById(id: string): Promise<email_change_requests | null> {
    return this.prisma.email_change_requests.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Partial<email_change_requests>) {
    return this.prisma.email_change_requests.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  incrementAttempts(id: string) {
    return this.prisma.email_change_requests.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        updated_at: new Date(),
      },
    });
  }

  updateForResend(input: {
    id: string;
    otpHash: string;
    expiresAt: Date;
    lastSentAt: Date;
  }) {
    return this.prisma.email_change_requests.update({
      where: { id: input.id },
      data: {
        otp_hash: input.otpHash,
        expires_at: input.expiresAt,
        last_sent_at: input.lastSentAt,
        resend_count: { increment: 1 },
        attempts: 0,
        updated_at: new Date(),
      },
    });
  }

  verifyAndUpdateAccountEmail(input: {
    requestId: string;
    accountId: string;
    newEmail: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.email_change_requests.update({
        where: { id: input.requestId },
        data: {
          status: email_change_status.verified,
          verified_at: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.email_change_requests.updateMany({
        where: {
          account_id: input.accountId,
          status: email_change_status.pending,
          id: { not: input.requestId },
        },
        data: {
          status: email_change_status.cancelled,
          cancelled_at: new Date(),
          updated_at: new Date(),
        },
      });

      return tx.accounts.update({
        where: { id: input.accountId },
        data: {
          email: input.newEmail,
          updated_at: new Date(),
        },
        select: ACCOUNT_PUBLIC_SELECT,
      });
    });
  }
}
