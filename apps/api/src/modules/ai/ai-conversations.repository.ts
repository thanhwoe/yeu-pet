import { PrismaService } from '@app/database/prisma/prisma.service';
import { ai_conversation_status } from '@app/generated/prisma/client';
import { IAiConversationsRepository } from '@app/interfaces/ai-conversations-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiConversationsRepository implements IAiConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    account_id: string;
    pet_id?: string | null;
    title?: string | null;
  }) {
    return this.prisma.ai_conversations.create({
      data,
    });
  }

  findAll(params: { account_id: string; skip?: number; take?: number }) {
    const where = {
      account_id: params.account_id,
      status: {
        not: ai_conversation_status.deleted,
      },
    };

    return this.prisma.$transaction([
      this.prisma.ai_conversations.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { updated_at: 'desc' },
        include: {
          pets: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
              species: true,
            },
          },
        },
      }),
      this.prisma.ai_conversations.count({ where }),
    ]);
  }

  findByUser(account_id: string, id: string) {
    return this.prisma.ai_conversations.findFirst({
      where: {
        id,
        account_id,
        status: {
          not: ai_conversation_status.deleted,
        },
      },
    });
  }

  update(
    id: string,
    data: Partial<{
      status: ai_conversation_status;
      title: string | null;
    }>,
  ) {
    return this.prisma.ai_conversations.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  deleteByUser(account_id: string, id: string) {
    return this.prisma.ai_conversations.updateMany({
      where: {
        id,
        account_id,
      },
      data: {
        status: ai_conversation_status.deleted,
        updated_at: new Date(),
      },
    });
  }
}
