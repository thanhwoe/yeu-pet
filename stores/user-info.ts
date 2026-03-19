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
  otpExpire: Date | null;
};

type Action = {
  updateUser: (data: IUser) => void;
  updateTokens: (data: State["tokens"]) => void;
  logout: () => void;
  clearToken: () => void;
  updateOtpExpire: (date: Date | null) => void;
};

const useUserInfoStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      otpExpire: null,

      updateUser: (user) => {
        set(() => ({ user }));
      },

      logout: () => set(() => ({ user: null, tokens: null })),

      clearToken: () => {
        set(() => ({
          tokens: null,
        }));
      },

      updateTokens: (tokens) => {
        set(() => ({
          tokens,
        }));
      },

      updateOtpExpire: (date) => {
        set(() => ({
          otpExpire: date,
        }));
      },
    }),
    {
      name: PERSIST_KEYS.USER_INFO,
      storage: createJSONStorage(() => SecureStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        otpExpire: state.otpExpire,
      }),
    },
  ),
);

export const useUserInfoStore = createSelectors(useUserInfoStoreBase);
