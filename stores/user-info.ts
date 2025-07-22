import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Constants
import { PERSIST_KEYS } from "@/constants/store";
import { IUser } from "@/interfaces/user";
import { createSelectors } from "./createSelector";
import { SecureStorage } from "./secure-store";

type State = {
  userInfo: IUser | null;
};

type Action = {
  updateUserInfo: (data: IUser) => void;
  logout: () => void;
};

const useUserInfoStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      userInfo: null,
      updateUserInfo: (userInfo) => {
        set(() => ({ userInfo }));
      },
      logout: () => set(() => ({ userInfo: null })),
    }),
    {
      name: PERSIST_KEYS.USER_INFO,
      storage: createJSONStorage(() => SecureStorage),
      partialize: (state) => ({
        userInfo: state.userInfo,
      }),
    }
  )
);

export const useUserInfoStore = createSelectors(useUserInfoStoreBase);
