import { ai_conversations } from '@app/generated/prisma/client';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';

export const IAiConversationsRepository = Symbol('IAiConversationsRepository');

export interface IAiConversationsRepository {
  create(data: {
    account_id: string;
    pet_id?: string | null;
    title?: string | null;
  }): Promise<ai_conversations>;
  findAll(params: {
    account_id: string;
    skip?: number;
    take?: number;
  }): Promise<[ai_conversations[], number]>;
  findByUser(account_id: string, id: string): Promise<ai_conversations | null>;
  update(
    id: string,
    data: Partial<Pick<ai_conversations, 'status' | 'title'>>,
  ): Promise<ai_conversations>;
  deleteByUser(account_id: string, id: string): Promise<BatchPayload>;
}
