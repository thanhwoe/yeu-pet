import { Stack } from "expo-router";
import "react-native-reanimated";

import { Providers } from "@/components/Providers";
import { useUserInfoStore } from "@/stores/user-info";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const { userInfo } = useUserInfoStore();
  const isAuthenticated = !!userInfo;
  const isOnboardingComplete = !!userInfo?.onboardingCompleted;
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && !isOnboardingComplete}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && isOnboardingComplete}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
    </Providers>
  );
}
