import { PERSIST_KEYS } from "@/constants/store";
import { ChatRole, IChatMessage } from "@/interfaces";
import {
  createAiConversationMutation,
  sendAiMessageMutation,
} from "@/services/ai";
import { isToday } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSelectors } from "./createSelector";

type State = {
  messages: IChatMessage[];
  loading: boolean;
  context: string | null;
  conversationId: string | null;
};

type Actions = {
  addMessage: (message: Omit<IChatMessage, "id" | "timestamp">) => void;
  clearMessage: () => void;
  setLoading: (loading: boolean) => void;
  setContext: (context: string) => void;
  setConversationId: (conversationId: string | null) => void;
  markTypingComplete: (messageId: string) => void;
  sendMessage: (content: string, context?: string) => Promise<void>;
};
const useChatStoreBase = create<State & Actions>()(
  persist(
    (set, get) => ({
      messages: [],
      loading: false,
      context: null,
      conversationId: null,
      addMessage: (message) => {
        const payload: IChatMessage = {
          ...message,
          id: v4(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, payload],
        }));
      },
      clearMessage: () =>
        set({ messages: [], context: null, conversationId: null }),
      setLoading: (loading) => set({ loading }),
      setContext: (context) => set({ context }),
      setConversationId: (conversationId) => set({ conversationId }),
      markTypingComplete: (messageId: string) => {
        set((state) => ({
          messages: state.messages.map((message) => {
            if (message.id === messageId) {
              return {
                ...message,
                typingCompleted: true,
              };
            }
            return message;
          }),
        }));
      },
      sendMessage: async (content, context) => {
        const userPayload: IChatMessage = {
          role: ChatRole.USER,
          content,
          context,
          id: v4(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userPayload],
          loading: true,
        }));

        try {
          const currentConversationId =
            get().conversationId ??
            (
              await createAiConversationMutation({
                title: content.slice(0, 80),
              })
            ).id;

          if (!get().conversationId) {
            set({ conversationId: currentConversationId });
          }

          const response = await sendAiMessageMutation({
            conversationId: currentConversationId,
            content,
          });

          const assistantPayload: IChatMessage = {
            role: ChatRole.ASSISTANT,
            content:
              response.assistantMessage?.content ??
              response.content ??
              response.message?.content ??
              "Sorry, I could not generate a response.",
            context,
            id: response.assistantMessage?.id ?? v4(),
            timestamp:
              response.assistantMessage?.createdAt ?? new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantPayload],
            loading: false,
          }));
        } catch (error: any) {
          console.log("AI error", error);
          const errorMessage: IChatMessage = {
            role: ChatRole.ASSISTANT,
            content: error?.message,
            id: v4(),
            timestamp: new Date().toISOString(),
          };
          set((state) => ({
            messages: [...state.messages, errorMessage],
            loading: false,
          }));
        }
      },
    }),
    {
      name: PERSIST_KEYS.AI_CHAT,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        context: state.context,
        conversationId: state.conversationId,
      }),
      onRehydrateStorage: () => {
        return async (state) => {
          if (state?.messages.length) {
            state.messages = state.messages.filter((message) =>
              isToday(message.timestamp)
            );
            state.conversationId = null;
          }
        };
      },
    }
  )
);
export const useChatStore = createSelectors(useChatStoreBase);
