import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Constants
import { PERSIST_KEYS } from "@/constants/store";
import { IDeviceResponse, IUser } from "@/interfaces/user";
import { createSelectors } from "./createSelector";
import { SecureStorage } from "./secure-store";

type DeviceInfo = Pick<
  IDeviceResponse,
  "id" | "isActive" | "deviceName" | "osVersion"
>;

type OptimisticAvatar = {
  uri: string;
  previousAvatarUrl: string | null;
  createdAt: number;
};

type State = {
  user: IUser | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  otpExpire: Date | null;
  deviceInfo: DeviceInfo | null;
  optimisticAvatar: OptimisticAvatar | null;
};

type Action = {
  updateUser: (data: IUser) => void;
  setOptimisticUserAvatar: (uri: string) => void;
  rollbackOptimisticUserAvatar: () => void;
  clearOptimisticUserAvatar: () => void;
  updateTokens: (data: State["tokens"]) => void;
  logout: () => void;
  clearToken: () => void;
  updateOtpExpire: (date: Date | null) => void;
  updateDeviceInfo: (data: DeviceInfo | null) => void;
};

const OPTIMISTIC_AVATAR_TTL_MS = 30 * 60 * 1000;

const getUserWithOptimisticAvatar = (
  user: IUser,
  optimisticAvatar: OptimisticAvatar | null,
) => {
  if (!optimisticAvatar) {
    return {
      optimisticAvatar,
      user,
    };
  }

  const expired =
    Date.now() - optimisticAvatar.createdAt > OPTIMISTIC_AVATAR_TTL_MS;
  const serverAvatarUrl = user.avatarUrl ?? null;
  const serverProcessedNewAvatar =
    Boolean(serverAvatarUrl) &&
    serverAvatarUrl !== optimisticAvatar.previousAvatarUrl &&
    serverAvatarUrl !== optimisticAvatar.uri;

  if (expired || serverProcessedNewAvatar) {
    return {
      optimisticAvatar: null,
      user,
    };
  }

  return {
    optimisticAvatar,
    user: {
      ...user,
      avatarUrl: optimisticAvatar.uri,
    },
  };
};

const useUserInfoStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      otpExpire: null,
      deviceInfo: null,
      optimisticAvatar: null,

      updateUser: (user) => {
        set((state) => getUserWithOptimisticAvatar(user, state.optimisticAvatar));
      },

      setOptimisticUserAvatar: (uri) => {
        set((state) => {
          if (!state.user) {
            return { optimisticAvatar: null };
          }

          const previousAvatarUrl =
            state.optimisticAvatar?.previousAvatarUrl ??
            state.user.avatarUrl ??
            null;
          const optimisticAvatar = {
            uri,
            previousAvatarUrl,
            createdAt: Date.now(),
          };

          return {
            optimisticAvatar,
            user: {
              ...state.user,
              avatarUrl: uri,
            },
          };
        });
      },

      rollbackOptimisticUserAvatar: () => {
        set((state) => ({
          optimisticAvatar: null,
          user: state.user
            ? {
                ...state.user,
                avatarUrl: state.optimisticAvatar?.previousAvatarUrl ?? null,
              }
            : state.user,
        }));
      },

      clearOptimisticUserAvatar: () => {
        set(() => ({
          optimisticAvatar: null,
        }));
      },

      logout: () =>
        set(() => ({
          user: null,
          tokens: null,
          otpExpire: null,
          optimisticAvatar: null,
        })),

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

      updateDeviceInfo: (data) => {
        set(() => ({
          deviceInfo: data,
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
        deviceInfo: state.deviceInfo,
        optimisticAvatar: state.optimisticAvatar,
      }),
    },
  ),
);

export const useUserInfoStore = createSelectors(useUserInfoStoreBase);
