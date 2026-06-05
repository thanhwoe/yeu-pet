import { API_ROUTES } from "@/constants/api-routes";
import {
  AiConversation,
  AiCreateConversationInput,
  AiMessage,
  AiStreamResult,
  IPagination,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const getAiConversationsQuery = (params?: {
  page?: number;
  limit?: number;
}) =>
  APIs.get<IPagination<AiConversation>>(API_ROUTES.AI_CONVERSATIONS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const createAiConversationMutation = (
  params: AiCreateConversationInput,
) => APIs.post<AiConversation>(API_ROUTES.AI_CONVERSATIONS, { data: params });

export const getAiMessagesQuery = ({
  conversationId,
  ...params
}: {
  conversationId: string;
  page?: number;
  limit?: number;
}) =>
  APIs.get<IPagination<AiMessage>>(
    API_ROUTES.AI_CONVERSATION_MESSAGES(conversationId),
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );

export const sendAiMessageMutation = ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) =>
  APIs.post<string | AiStreamResult>(
    API_ROUTES.AI_CONVERSATION_MESSAGES_STREAM(conversationId),
    { data: { content } },
  ).then(parseAiStreamResult);

export const deleteAiConversationMutation = (conversationId: string) =>
  APIs.delete(API_ROUTES.AI_CONVERSATION_DETAIL(conversationId));

const parseAiStreamResult = (
  response: string | AiStreamResult,
): AiStreamResult => {
  if (typeof response !== "string") {
    return response;
  }

  const result: AiStreamResult = {};
  const events = response
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const eventBlock of events) {
    const eventName = eventBlock.match(/^event:\s*(.+)$/m)?.[1];
    const data = eventBlock.match(/^data:\s*(.+)$/m)?.[1];

    if (!eventName || !data) {
      continue;
    }

    try {
      const parsed = JSON.parse(data);

      if (eventName === "message") {
        result.message = parsed;
        result.content = parsed.content;
        result.safety = parsed.safety;
      }

      if (eventName === "done") {
        result.assistantMessage = parsed.assistantMessage;
        result.userMessage = parsed.userMessage;
      }
    } catch {
      // Ignore malformed SSE fragments and let the UI show the parsed pieces.
    }
  }

  return result;
};
