export interface GeminiRequestOptions {
  message: string;
  context?: string | null;
  conversationHistory?: {
    role: ChatRole;
    content: string;
  }[];
}

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

export interface IGeminiResponse {
  message: string;
  disclaimers?: string[];
}
