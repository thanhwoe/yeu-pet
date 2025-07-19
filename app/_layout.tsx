import { Stack } from "expo-router";
import "react-native-reanimated";

import { Providers } from "@/components/Providers";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const isAuthenticated = true;
  const isOnboardingComplete = true;
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
