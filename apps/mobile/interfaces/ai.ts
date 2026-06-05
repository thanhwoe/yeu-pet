export enum ChatRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface IChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  context?: string | null;
  timestamp: string;
  typingCompleted?: boolean;
}

export interface AiConversation {
  id: string;
  accountId: string;
  petId: string | null;
  title: string;
  status: "active" | "archived" | "deleted";
  createdAt: string | null;
  updatedAt: string | null;
  lastMessageAt: string | null;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  accountId: string;
  role: ChatRole;
  content: string;
  provider: string | null;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  safetyFlags?: unknown;
  createdAt: string | null;
}

export interface AiCreateConversationInput {
  petId?: string;
  title?: string;
}

export interface AiSafetyResult {
  urgent?: boolean;
  flags?: string[];
}

export interface AiStreamResult {
  content?: string;
  safety?: AiSafetyResult;
  assistantMessage?: AiMessage;
  userMessage?: AiMessage;
  message?: {
    content?: string;
    safety?: AiSafetyResult;
  };
}
