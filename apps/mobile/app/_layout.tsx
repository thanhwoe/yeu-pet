import "react-native-gesture-handler";
import "react-native-reanimated";

import { Href, Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { BackHeader } from "@/components/Headers/BackHeader";
import { ProductDetailHeader } from "@/components/Headers/ProductDetailHeader";
import { Providers } from "@/components/Providers";
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
      <NotificationNavigationHandler />
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
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/verify-email"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="doctor-ai"
          options={{
            header: BackHeader,
            title: "Doctor AI",
          }}
        />
        <Stack.Screen
          name="sitter-bookings/[id]/chat"
          options={{
            header: BackHeader,
            title: "Booking messages",
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

const NotificationNavigationHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const openNotification = (response: Notifications.NotificationResponse) => {
      const deepLink = response.notification.request.content.data.deepLink;

      if (typeof deepLink === "string" && deepLink.startsWith("/")) {
        router.push(deepLink as Href);
      }
    };

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(openNotification);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) {
        return;
      }

      openNotification(response);
      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => responseSubscription.remove();
  }, [router]);

  return null;
};
