import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Constants
import { PERSIST_KEYS } from "@/constants/store";
import { IUser } from "@/interfaces/user";
import { createSelectors } from "./createSelector";
import { SecureStorage } from "./secure-store";

type State = {
  user: IUser | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
};

type Action = {
  updateUser: (data: IUser) => void;
  updateTokens: (data: State["tokens"]) => void;
  logout: () => void;
  clearToken: () => void;
};

const useUserInfoStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      updateUser: (user) => {
        set(() => ({ user }));
      },
      logout: () => set(() => ({ user: null, tokens: null })),
      clearToken: () => {
        set(() => ({
          tokens: null,
        }));
      },
      updateTokens: (tokens) =>
        set(() => ({
          tokens,
        })),
    }),
    {
      name: PERSIST_KEYS.USER_INFO,
      storage: createJSONStorage(() => SecureStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    },
  ),
);

export const useUserInfoStore = createSelectors(useUserInfoStoreBase);
