import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { preferencesStorage } from "./storage";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string | null;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  subscription?: "free" | "premium" | string;
  subscriptionExpiresAt?: string | null;
};

type UserState = {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  otpExpire: string | null;
  deviceInfo: Record<string, unknown> | null;
  updateUser: (user: UserProfile) => void;
  updateTokens: (tokens: AuthTokens) => void;
  updateOtpExpire: (date: string | null) => void;
  updateDeviceInfo: (info: Record<string, unknown> | null) => void;
  logout: () => void;
};

const STORAGE_KEY = "yeu-pet-user";

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      otpExpire: null,
      deviceInfo: null,
      updateUser: (user) => set({ user }),
      updateTokens: (tokens) => set({ tokens }),
      updateOtpExpire: (otpExpire) => set({ otpExpire }),
      updateDeviceInfo: (deviceInfo) => set({ deviceInfo }),
      logout: () =>
        set({ user: null, tokens: null, otpExpire: null, deviceInfo: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        otpExpire: state.otpExpire,
        deviceInfo: state.deviceInfo,
      }),
    },
  ),
);
