import { Preferences } from "@capacitor/preferences";
import type { StateStorage } from "zustand/middleware";

/**
 * Zustand persist adapter backed by Capacitor Preferences.
 * TODO: migrate tokens to a secure storage plugin before production.
 */
export const preferencesStorage: StateStorage = {
  getItem: async (name) => {
    const { value } = await Preferences.get({ key: name });
    return value ?? null;
  },
  setItem: async (name, value) => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name) => {
    await Preferences.remove({ key: name });
  },
};
