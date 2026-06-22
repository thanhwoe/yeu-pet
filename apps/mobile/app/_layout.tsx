import "react-native-gesture-handler";
import "react-native-reanimated";

import {
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import { Href, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { BackHeader } from "@/components/Headers/BackHeader";
import { ProductDetailHeader } from "@/components/Headers/ProductDetailHeader";
import { Providers } from "@/components/Providers";
import { UserSync } from "@/components/UserSync";
import { NOTIFICATIONS_KEY, REMINDER_KEY } from "@/constants/query-keys";
import { markNotificationReadMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    const openNotification = (message: RemoteMessage) => {
      const notificationData = message.data ?? {};
      const deepLink = notificationData.deepLink;
      const notificationId = notificationData.notificationId;

      if (typeof notificationId === "string" && notificationId) {
        void markNotificationReadMutation(notificationId)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: NOTIFICATIONS_KEY.all,
            });
          })
          .catch(() => undefined);
      }

      if (notificationData.notificationType === "reminder_due") {
        void queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      }

      if (typeof deepLink === "string" && deepLink.startsWith("/")) {
        router.push(deepLink as Href);
      }
    };

    const unsubscribeOpened = onNotificationOpenedApp(
      getMessaging(),
      openNotification,
    );

    void getInitialNotification(getMessaging())
      .then((message) => {
        if (message) {
          openNotification(message);
        }
      })
      .catch(() => undefined);

    return unsubscribeOpened;
  }, [queryClient, router]);

  return null;
};
