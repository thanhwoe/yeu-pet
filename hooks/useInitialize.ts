import { useUserInfoStore } from "@/stores";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";

export const useInitialize = () => {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [hydratedUserStore, setHydratedUserStore] = useState(
    useUserInfoStore.persist.hasHydrated()
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

  return fontsLoaded && hydratedUserStore;
};
