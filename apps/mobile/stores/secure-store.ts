import * as SecureStore from "expo-secure-store";
import { StateStorage } from "zustand/middleware";

export const SecureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value;
    } catch (error) {
      console.log(`SecureStore getItem error: ${error}`);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.log(`SecureStore setItem error: ${error}`);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.log(`SecureStore removeItem error: ${error}`);
    }
  },
};
