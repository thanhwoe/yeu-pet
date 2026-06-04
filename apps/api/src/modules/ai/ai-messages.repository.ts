import { PrismaService } from '@app/database/prisma/prisma.service';
import { ai_message_role } from '@app/generated/prisma/client';
import { InputJsonValue } from '@app/generated/prisma/internal/prismaNamespace';
import { IAiMessagesRepository } from '@app/interfaces/ai-messages-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiMessagesRepository implements IAiMessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    conversation_id: string;
    account_id: string;
    role: ai_message_role;
    content: string;
    model?: string | null;
    provider?: string | null;
    input_tokens?: number | null;
    output_tokens?: number | null;
    safety_flags?: InputJsonValue;
  }) {
    return this.prisma.ai_messages.create({
      data,
    });
  }

  findAll(params: { conversation_id: string; skip?: number; take?: number }) {
    const where = {
      conversation_id: params.conversation_id,
    };

    return this.prisma.$transaction([
      this.prisma.ai_messages.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.ai_messages.count({ where }),
    ]);
  }

  findRecent(conversation_id: string, take: number) {
    return this.prisma.ai_messages.findMany({
      where: {
        conversation_id,
      },
      take,
      orderBy: { created_at: 'desc' },
    });
  }
}
