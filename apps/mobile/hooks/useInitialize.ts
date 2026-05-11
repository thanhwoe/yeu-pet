import { useUserInfoStore } from "@/stores";
import { useEffect, useState } from "react";

export const useInitialize = () => {
  const [hydratedUserStore, setHydratedUserStore] = useState(
    useUserInfoStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubFinishUserStoreHydration =
      useUserInfoStore.persist.onFinishHydration(() => {
        setHydratedUserStore(true);
      });

    return () => {
      unsubFinishUserStoreHydration();
    };
  }, []);

  return hydratedUserStore;
};
