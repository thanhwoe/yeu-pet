import { PrismaService } from '@app/database/prisma/prisma.service';
import { IAiUsageLogsRepository } from '@app/interfaces/ai-usage-logs-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiUsageLogsRepository implements IAiUsageLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    account_id: string;
    conversation_id?: string | null;
    provider: string;
    model: string;
    input_tokens?: number;
    output_tokens?: number;
  }) {
    await this.prisma.ai_usage_logs.create({
      data,
    });
  }
}
