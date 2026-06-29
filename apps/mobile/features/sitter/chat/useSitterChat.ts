import "react-native-get-random-values";

import { SITTER_BOOKING_KEY } from "@/constants/query-keys";
import { useSitterBookingMessages } from "@/features/sitter/useSitters";
import type { IPagination, ISitterBookingMessage } from "@/interfaces";
import { createSitterBookingMessageMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";
import { v4 as uuid } from "uuid";
import { createSitterChatSocket, SitterChatSocket } from "./sitterChatSocket";
import type {
  LocalChatMessage,
  SitterChatConnectionState,
  SitterChatError,
} from "./sitterChat.types";

const ACK_TIMEOUT_MS = 8000;

const sortMessages = (messages: LocalChatMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

const mergeMessage = (
  messages: LocalChatMessage[],
  incoming: LocalChatMessage,
) => {
  const index = messages.findIndex(
    (message) =>
      message.id === incoming.id ||
      (incoming.clientMessageId &&
        message.clientMessageId === incoming.clientMessageId),
  );
  if (index === -1) return sortMessages([...messages, incoming]);

  const next = [...messages];
  next[index] = { ...next[index], ...incoming };
  return sortMessages(next);
};

export const useSitterChat = (bookingId: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const messagesQuery = useSitterBookingMessages(bookingId);
  const currentUser = useUserInfoStore.use.user();
  const tokens = useUserInfoStore.use.tokens();
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<SitterChatConnectionState>("connecting");
  const [lastError, setLastError] = useState<string>();
  const socketRef = useRef<SitterChatSocket | null>(null);
  const joinedRef = useRef(false);
  const connectedOnceRef = useRef(false);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const clearAckTimer = useCallback((clientMessageId?: string | null) => {
    if (!clientMessageId) return;
    const timer = timersRef.current.get(clientMessageId);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(clientMessageId);
  }, []);

  const reconcileServerMessage = useCallback(
    (message: ISitterBookingMessage) => {
      clearAckTimer(message.clientMessageId);
      setMessages((current) =>
        mergeMessage(current, {
          ...message,
          isOptimistic: false,
          localStatus: "sent",
        }),
      );
    },
    [clearAckTimer],
  );

  useEffect(() => {
    const history = messagesQuery.data?.data;
    if (!history) return;
    setMessages((current) =>
      history.reduce(
        (merged, message) =>
          mergeMessage(merged, {
            ...message,
            isOptimistic: false,
            localStatus: "sent",
          }),
        current,
      ),
    );
  }, [messagesQuery.data?.data]);

  const sendViaHttp = useCallback(
    async (message: LocalChatMessage) => {
      try {
        const persisted = await createSitterBookingMessageMutation({
          bookingId,
          content: message.content ?? "",
          type: "text",
          clientMessageId: message.clientMessageId ?? undefined,
        });
        reconcileServerMessage(persisted);
        queryClient.setQueryData<IPagination<ISitterBookingMessage>>(
          SITTER_BOOKING_KEY.messages(bookingId),
          (current) =>
            current
              ? {
                  ...current,
                  data: mergeMessage(current.data, persisted),
                }
              : current,
        );
      } catch {
        setMessages((current) =>
          current.map((item) =>
            item.clientMessageId === message.clientMessageId
              ? { ...item, localStatus: "failed" }
              : item,
          ),
        );
        setLastError(t("sitter.chat.sendFailedRetry"));
      }
    },
    [bookingId, queryClient, reconcileServerMessage, t],
  );

  const emitMessage = useCallback(
    (message: LocalChatMessage) => {
      const socket = socketRef.current;
      if (!socket?.connected || !joinedRef.current) {
        void sendViaHttp(message);
        return;
      }

      socket.emit("sitterChat:sendMessage", {
        bookingId,
        clientMessageId: message.clientMessageId ?? message.id,
        content: message.content ?? "",
      });
      clearAckTimer(message.clientMessageId);
      const timer = setTimeout(() => {
        void sendViaHttp(message);
      }, ACK_TIMEOUT_MS);
      timersRef.current.set(message.clientMessageId ?? message.id, timer);
    },
    [bookingId, clearAckTimer, sendViaHttp],
  );

  useEffect(() => {
    const accessToken = tokens?.accessToken;
    if (!accessToken || !bookingId) {
      setConnectionState("offline");
      return;
    }

    connectedOnceRef.current = false;
    const socket = createSitterChatSocket(accessToken);
    socketRef.current = socket;
    setConnectionState("connecting");

    const joinRoom = () => {
      joinedRef.current = false;
      socket.emit("sitterChat:join", { bookingId });
    };

    socket.on("connect", () => {
      setConnectionState(
        connectedOnceRef.current ? "reconnecting" : "connecting",
      );
      joinRoom();
    });
    socket.on("sitterChat:joined", ({ bookingId: joinedBookingId }) => {
      if (joinedBookingId !== bookingId) return;
      const wasConnected = connectedOnceRef.current;
      joinedRef.current = true;
      connectedOnceRef.current = true;
      setConnectionState("connected");
      setLastError(undefined);
      if (wasConnected) void messagesQuery.refetch();
    });
    socket.on("sitterChat:newMessage", ({ message }) => {
      if (message.bookingId === bookingId) reconcileServerMessage(message);
    });
    socket.on("sitterChat:messageAck", (ack) => {
      if (ack.bookingId === bookingId) reconcileServerMessage(ack.message);
    });
    socket.on("sitterChat:error", (error: SitterChatError) => {
      if (error.bookingId && error.bookingId !== bookingId) return;
      if (error.clientMessageId) {
        clearAckTimer(error.clientMessageId);
        setMessages((current) =>
          current.map((message) =>
            message.clientMessageId === error.clientMessageId
              ? { ...message, localStatus: "failed" }
              : message,
          ),
        );
      }
      if (
        !error.clientMessageId &&
        ["UNAUTHORIZED", "FORBIDDEN", "BOOKING_NOT_FOUND"].includes(error.code)
      ) {
        setConnectionState("offline");
      }
      setLastError(error.message);
    });
    socket.on("disconnect", () => {
      joinedRef.current = false;
      setConnectionState(connectedOnceRef.current ? "reconnecting" : "offline");
    });
    socket.on("connect_error", () => {
      joinedRef.current = false;
      setConnectionState("offline");
    });

    socket.connect();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          if (!socket.connected) {
            setConnectionState(
              connectedOnceRef.current ? "reconnecting" : "connecting",
            );
            socket.connect();
          }
        } else {
          if (socket.connected) socket.emit("sitterChat:leave", { bookingId });
          socket.disconnect();
        }
      },
    );

    return () => {
      if (socket.connected) socket.emit("sitterChat:leave", { bookingId });
      socket.removeAllListeners();
      socket.disconnect();
      appStateSubscription.remove();
      joinedRef.current = false;
      socketRef.current = null;
    };
  }, [
    bookingId,
    clearAckTimer,
    messagesQuery.refetch,
    reconcileServerMessage,
    tokens?.accessToken,
  ]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    },
    [],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !currentUser) return false;

      const clientMessageId = uuid();
      const optimistic: LocalChatMessage = {
        id: `local:${clientMessageId}`,
        bookingId,
        senderAccountId: currentUser.id,
        type: "text",
        content: trimmed,
        imageUrl: null,
        clientMessageId,
        createdAt: new Date().toISOString(),
        readAt: null,
        localStatus: "pending",
        isOptimistic: true,
      };
      setMessages((current) => mergeMessage(current, optimistic));
      setLastError(undefined);
      emitMessage(optimistic);
      return true;
    },
    [bookingId, currentUser, emitMessage],
  );

  const retryMessage = useCallback(
    (message: LocalChatMessage) => {
      setMessages((current) =>
        current.map((item) =>
          item.clientMessageId === message.clientMessageId
            ? { ...item, localStatus: "pending" }
            : item,
        ),
      );
      setLastError(undefined);
      emitMessage({ ...message, localStatus: "pending" });
    },
    [emitMessage],
  );

  return {
    messages,
    messagesQuery,
    connectionState,
    lastError,
    currentUserId: currentUser?.id,
    sendMessage,
    retryMessage,
  };
};
