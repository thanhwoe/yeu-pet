import { ai_message_role, ai_messages } from '@app/generated/prisma/client';
import { InputJsonValue } from '@app/generated/prisma/internal/prismaNamespace';

export const IAiMessagesRepository = Symbol('IAiMessagesRepository');

export interface IAiMessagesRepository {
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
  }): Promise<ai_messages>;
  findAll(params: {
    conversation_id: string;
    skip?: number;
    take?: number;
  }): Promise<[ai_messages[], number]>;
  findRecent(conversation_id: string, take: number): Promise<ai_messages[]>;
}
