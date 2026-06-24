import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { syncRevenueCatForUser } from "@/features/subscriptions/cache";
import { useUserInfoStore } from "@/stores/user-info";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

export function RevenueCatSync() {
  const queryClient = useQueryClient();
  const userId = useUserInfoStore.use.user()?.id;
  const accessToken = useUserInfoStore.use.tokens()?.accessToken;
  const syncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!userId || !accessToken || syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    try {
      await syncRevenueCatForUser(queryClient, userId);
    } catch (error) {
      console.warn("[RevenueCat] Subscription sync failed.", error);
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
    } finally {
      syncingRef.current = false;
    }
  }, [accessToken, queryClient, userId]);

  useEffect(() => {
    if (!userId || !accessToken) {
      return;
    }

    void sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void sync();
      }
    });

    return () => subscription.remove();
  }, [accessToken, sync, userId]);

  return null;
}
