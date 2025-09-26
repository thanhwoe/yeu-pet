import { Stack } from "expo-router";
import "react-native-reanimated";

import { BackHeader } from "@/components/Headers/BackHeader";
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
      <Stack>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && !isOnboardingComplete}>
          <Stack.Screen
            name="(onboarding)"
            options={{
              headerShown: false,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && isOnboardingComplete}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="list-clinic"
            options={{
              header: BackHeader,
              title: "List Clinic",
            }}
          />

          <Stack.Screen
            name="list-spa"
            options={{
              header: BackHeader,
              title: "List Spa",
            }}
          />
          <Stack.Screen
            name="budget"
            options={{
              header: BackHeader,
              title: "Budget statistics",
            }}
          />
          <Stack.Screen
            name="photos"
            options={{
              header: BackHeader,
              title: "Share photos",
            }}
          />
          <Stack.Screen name="(training)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen
          name="+not-found"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </Providers>
  );
}
