import { PrismaService } from '@app/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export interface CreateEmailLogInput {
  accountId?: string;
  bookingId?: string;
  to: string;
  subject: string;
}

export interface UpdateEmailLogStatusInput {
  resendEmailId?: string;
  status: string;
  error?: string;
}

@Injectable()
export class EmailLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createLog(input: CreateEmailLogInput) {
    return this.prisma.email_logs.create({
      data: {
        account_id: input.accountId,
        booking_id: input.bookingId,
        to_email: this.normalizeEmail(input.to),
        subject: input.subject,
        status: 'pending',
      },
    });
  }

  updateStatus(id: string, input: UpdateEmailLogStatusInput) {
    return this.prisma.email_logs.update({
      where: { id },
      data: {
        resend_email_id: input.resendEmailId,
        status: input.status,
        error: input.error,
        updated_at: new Date(),
      },
    });
  }

  findSuppression(email: string) {
    return this.prisma.email_suppressions.findUnique({
      where: {
        email: this.normalizeEmail(email),
      },
    });
  }

  suppressEmail(email: string, reason: string) {
    return this.prisma.email_suppressions.upsert({
      where: {
        email: this.normalizeEmail(email),
      },
      create: {
        email: this.normalizeEmail(email),
        reason,
      },
      update: {
        reason,
      },
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
