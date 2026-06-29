import { AI_KEY, SUBSCRIPTION_KEY } from "@/constants/query-keys";
import {
  AiMessage,
  AiStreamResult,
  ChatRole,
  IChatMessage,
  IPagination,
} from "@/interfaces";
import { i18n } from "@/i18n";
import {
  createAiConversationMutation,
  getAiConversationsQuery,
  getAiMessagesQuery,
  sendAiMessageMutation,
} from "@/services/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import "react-native-get-random-values";
import { v4 } from "uuid";

const CONVERSATION_PARAMS = { page: 1, limit: 20 };
const MESSAGE_PARAMS = { page: 1, limit: 50 };
const getAssistantErrorMessage = () =>
  i18n.t("ai.fallback.assistantErrorMessage");

type DoctorAiMessage = AiMessage & {
  typingCompleted?: boolean;
  optimistic?: boolean;
};

type DoctorAiMessagesPage = IPagination<DoctorAiMessage>;

type SendDoctorAiMessageInput = {
  clientMessageId: string;
  content: string;
  petId: string | null;
  displayConversationId: string;
};

type SendDoctorAiMessageResult = {
  conversationId: string;
  petId: string | null;
  response: AiStreamResult;
};

type SendDoctorAiMessageContext = {
  previousMessages?: DoctorAiMessagesPage;
};

export function useDoctorAiChat({ petId }: { petId: string | null }) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeConversationPetId, setActiveConversationPetId] = useState<
    string | null
  >(petId);

  useEffect(() => {
    if (activeConversationPetId !== petId) {
      setActiveConversationId(null);
      setActiveConversationPetId(petId);
    }
  }, [activeConversationPetId, petId]);

  const conversationsQuery = useQuery({
    queryKey: AI_KEY.conversationList(CONVERSATION_PARAMS),
    queryFn: () => getAiConversationsQuery(CONVERSATION_PARAMS),
  });

  const matchingConversation = useMemo(
    () =>
      conversationsQuery.data?.data.find(
        (conversation) =>
          conversation.status === "active" &&
          (conversation.petId ?? null) === petId,
      ),
    [conversationsQuery.data?.data, petId],
  );

  const displayConversationId =
    activeConversationId ?? createDraftConversationId(petId);
  const messagesQueryKey = AI_KEY.messages(displayConversationId, MESSAGE_PARAMS);
  const isServerConversation = Boolean(activeConversationId);

  const messagesQuery = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () =>
      getAiMessagesQuery({
        conversationId: displayConversationId,
        ...MESSAGE_PARAMS,
      }) as Promise<DoctorAiMessagesPage>,
    enabled: isServerConversation,
  });

  useEffect(() => {
    if (
      !activeConversationId &&
      matchingConversation &&
      !messagesQuery.data?.data?.length
    ) {
      setActiveConversationId(matchingConversation.id);
      setActiveConversationPetId(matchingConversation.petId ?? null);
    }
  }, [
    activeConversationId,
    matchingConversation,
    messagesQuery.data?.data?.length,
  ]);

  const sendMutation = useMutation<
    SendDoctorAiMessageResult,
    Error,
    SendDoctorAiMessageInput,
    SendDoctorAiMessageContext
  >({
    mutationFn: async ({ content, petId }) => {
      const conversationId =
        activeConversationId && activeConversationPetId === petId
          ? activeConversationId
          : (
              await createAiConversationMutation({
                title: content.slice(0, 80),
                petId: petId ?? undefined,
              })
            ).id;

      const response = await sendAiMessageMutation({
        conversationId,
        content,
      });

      return {
        conversationId,
        petId,
        response,
      };
    },
    onMutate: async (variables) => {
      const queryKey = AI_KEY.messages(
        variables.displayConversationId,
        MESSAGE_PARAMS,
      );

      await queryClient.cancelQueries({ queryKey });

      const previousMessages =
        queryClient.getQueryData<DoctorAiMessagesPage>(queryKey);

      queryClient.setQueryData<DoctorAiMessagesPage>(queryKey, (current) =>
        appendMessage(current, createOptimisticUserMessage(variables)),
      );

      return { previousMessages };
    },
    onSuccess: async (result, variables) => {
      const draftQueryKey = AI_KEY.messages(
        variables.displayConversationId,
        MESSAGE_PARAMS,
      );
      const serverQueryKey = AI_KEY.messages(result.conversationId, MESSAGE_PARAMS);

      if (result.conversationId !== variables.displayConversationId) {
        const draftMessages =
          queryClient.getQueryData<DoctorAiMessagesPage>(draftQueryKey);
        queryClient.setQueryData<DoctorAiMessagesPage>(
          serverQueryKey,
          draftMessages ?? createEmptyMessagesPage(),
        );
        queryClient.removeQueries({ exact: true, queryKey: draftQueryKey });
      }

      queryClient.setQueryData<DoctorAiMessagesPage>(serverQueryKey, (current) =>
        applySuccessfulResponse(current, variables, result.response),
      );

      setActiveConversationId(result.conversationId);
      setActiveConversationPetId(result.petId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all }),
        queryClient.invalidateQueries({ queryKey: AI_KEY.conversations() }),
      ]);
    },
    onError: (_error, variables, context) => {
      const queryKey = AI_KEY.messages(
        variables.displayConversationId,
        MESSAGE_PARAMS,
      );

      queryClient.setQueryData<DoctorAiMessagesPage>(queryKey, (current) => {
        const baseMessages = current ?? context?.previousMessages;
        return appendMessage(baseMessages, createAssistantErrorMessage());
      });
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent || sendMutation.isPending) {
        return;
      }

      await sendMutation
        .mutateAsync({
          clientMessageId: v4(),
          content: trimmedContent,
          displayConversationId,
          petId,
        })
        .catch(() => undefined);
    },
    [displayConversationId, petId, sendMutation],
  );

  const markTypingComplete = useCallback(
    (messageId: string) => {
      queryClient.setQueryData<DoctorAiMessagesPage>(messagesQueryKey, (current) =>
        updateMessage(current, messageId, { typingCompleted: true }),
      );
    },
    [messagesQueryKey, queryClient],
  );

  const messages = useMemo(
    () => (messagesQuery.data?.data ?? []).map(toChatMessage),
    [messagesQuery.data?.data],
  );

  return {
    loading: sendMutation.isPending,
    isLoadingHistory:
      conversationsQuery.isLoading ||
      (isServerConversation && messagesQuery.isLoading),
    markTypingComplete,
    messages,
    sendMessage,
  };
}

function createDraftConversationId(petId: string | null) {
  return `draft:${petId ?? "general"}`;
}

function createEmptyMessagesPage(): DoctorAiMessagesPage {
  return {
    data: [],
    meta: {
      total: 0,
      page: MESSAGE_PARAMS.page,
      limit: MESSAGE_PARAMS.limit,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

function appendMessage(
  current: DoctorAiMessagesPage | undefined,
  message: DoctorAiMessage,
): DoctorAiMessagesPage {
  const page = current ?? createEmptyMessagesPage();

  return {
    ...page,
    data: [...page.data, message],
    meta: {
      ...page.meta,
      total: page.meta.total + 1,
    },
  };
}

function updateMessage(
  current: DoctorAiMessagesPage | undefined,
  messageId: string,
  patch: Partial<DoctorAiMessage>,
): DoctorAiMessagesPage | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    data: current.data.map((message) =>
      message.id === messageId ? { ...message, ...patch } : message,
    ),
  };
}

function applySuccessfulResponse(
  current: DoctorAiMessagesPage | undefined,
  variables: SendDoctorAiMessageInput,
  response: AiStreamResult,
): DoctorAiMessagesPage {
  const page = current ?? createEmptyMessagesPage();
  const serverUserMessage = response.userMessage;
  const assistantMessage = toAssistantMessage(response);
  const userMessageExists = serverUserMessage
    ? page.data.some((message) => message.id === serverUserMessage.id)
    : false;
  let replacedOptimisticUserMessage = false;
  const nextMessages = page.data.map((message) =>
    message.id === getOptimisticUserMessageId(variables)
      ? ((replacedOptimisticUserMessage = true), serverUserMessage ?? message)
      : message,
  );

  if (serverUserMessage && !userMessageExists && !replacedOptimisticUserMessage) {
    nextMessages.push(serverUserMessage);
  }

  if (!nextMessages.some((message) => message.id === assistantMessage.id)) {
    nextMessages.push(assistantMessage);
  }
  const dedupedMessages = dedupeMessagesById(nextMessages);

  return {
    ...page,
    data: dedupedMessages,
    meta: {
      ...page.meta,
      total: dedupedMessages.length,
    },
  };
}

function dedupeMessagesById(messages: DoctorAiMessage[]) {
  const seenIds = new Set<string>();

  return messages.filter((message) => {
    if (seenIds.has(message.id)) {
      return false;
    }

    seenIds.add(message.id);
    return true;
  });
}

function toAssistantMessage(response: AiStreamResult): DoctorAiMessage {
  const assistantMessage = response.assistantMessage;

  if (assistantMessage) {
    return {
      ...assistantMessage,
      typingCompleted: false,
    };
  }

  return {
    accountId: "",
    content:
      response.content ??
      response.message?.content ??
      i18n.t("ai.fallback.generateResponse"),
    conversationId: "",
    createdAt: new Date().toISOString(),
    id: v4(),
    inputTokens: 0,
    model: null,
    outputTokens: 0,
    provider: null,
    role: ChatRole.ASSISTANT,
    safetyFlags: response.safety ?? response.message?.safety,
    typingCompleted: false,
  };
}

function createOptimisticUserMessage(
  variables: SendDoctorAiMessageInput,
): DoctorAiMessage {
  return {
    accountId: "",
    content: variables.content,
    conversationId: variables.displayConversationId,
    createdAt: new Date().toISOString(),
    id: getOptimisticUserMessageId(variables),
    inputTokens: 0,
    model: null,
    optimistic: true,
    outputTokens: 0,
    provider: null,
    role: ChatRole.USER,
  };
}

function createAssistantErrorMessage(): DoctorAiMessage {
  return {
    accountId: "",
    content: getAssistantErrorMessage(),
    conversationId: "",
    createdAt: new Date().toISOString(),
    id: v4(),
    inputTokens: 0,
    model: null,
    outputTokens: 0,
    provider: null,
    role: ChatRole.ASSISTANT,
    typingCompleted: false,
  };
}

function getOptimisticUserMessageId(variables: SendDoctorAiMessageInput) {
  return variables.clientMessageId;
}

function toChatMessage(message: DoctorAiMessage): IChatMessage {
  return {
    content: message.content,
    id: message.id,
    role: message.role,
    timestamp: message.createdAt ?? new Date().toISOString(),
    typingCompleted: message.typingCompleted,
  };
}
