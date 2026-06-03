import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { BackHeader } from "@/components/Headers/BackHeader";
import { ProductDetailHeader } from "@/components/Headers/ProductDetailHeader";
import { Providers } from "@/components/Providers";
import { Toast } from "@/components/Toast";
import { UserSync } from "@/components/UserSync";
import { useUserInfoStore } from "@/stores/user-info";
import "../global.css";

export { ErrorBoundary } from "expo-router";

// SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true });

export default function RootLayout() {
  return (
    <Providers>
      <UserSync />
      <RootNavigation />
      <Toast />
    </Providers>
  );
}

const RootNavigation = () => {
  const { user } = useUserInfoStore();
  const isAuthenticated = !!user;
  const isOnboardingComplete = !!user?.onboardingCompleted;
  const isVerified = !!user?.isVerified;

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !isVerified}>
        <Stack.Screen
          name="verify-otp"
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

      <Stack.Protected
        guard={isAuthenticated && isOnboardingComplete && isVerified}
      >
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
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="medical-record" options={{ headerShown: false }} />
        <Stack.Screen
          name="photos"
          options={{
            header: BackHeader,
            title: "Share photos",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            header: BackHeader,
            title: "Notifications",
          }}
        />
        <Stack.Screen
          name="doctor-ai"
          options={{
            header: BackHeader,
            title: "Doctor AI",
          }}
        />
        <Stack.Screen
          name="products/[productId]"
          options={{
            header: ProductDetailHeader,
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            header: BackHeader,
            title: "Cart",
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            header: BackHeader,
            title: "Checkout",
          }}
        />
        <Stack.Screen
          name="shipping-address"
          options={{
            header: BackHeader,
            title: "Shipping Address",
          }}
        />
        <Stack.Screen name="training" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen
        name="+not-found"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};
