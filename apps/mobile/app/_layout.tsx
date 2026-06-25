import "react-native-gesture-handler";
import "react-native-reanimated";
import "@/i18n";

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
import { RevenueCatSync } from "@/features/subscriptions/components/RevenueCatSync";
import { markNotificationReadMutation } from "@/services";
import { configureRevenueCat } from "@/services/revenuecat";
import { useUserInfoStore } from "@/stores/user-info";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import "../global.css";

export { ErrorBoundary } from "expo-router";

// SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true });
void configureRevenueCat();

export default function RootLayout() {
  return (
    <Providers>
      <UserSync />
      <RevenueCatSync />
      <RootNavigation />
      <NotificationNavigationHandler />
    </Providers>
  );
}

const RootNavigation = () => {
  const { user } = useUserInfoStore();
  const { t } = useTranslation();
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
            title: t("navigation.listClinic"),
          }}
        />

        <Stack.Screen
          name="list-spa"
          options={{
            header: BackHeader,
            title: t("navigation.listSpa"),
          }}
        />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="medical-record" options={{ headerShown: false }} />
        <Stack.Screen
          name="photos"
          options={{
            header: BackHeader,
            title: t("navigation.photos"),
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            header: BackHeader,
            title: t("navigation.notifications"),
          }}
        />
        <Stack.Screen
          name="notification-settings"
          options={{
            header: BackHeader,
            title: t("navigation.notificationSettings"),
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            header: BackHeader,
            title: t("navigation.planUsage"),
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
            title: t("navigation.doctorAi"),
          }}
        />
        <Stack.Screen
          name="sitter-bookings/[id]/chat"
          options={{
            header: BackHeader,
            title: t("navigation.bookingMessages"),
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
            title: t("navigation.cart"),
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            header: BackHeader,
            title: t("navigation.checkout"),
          }}
        />
        <Stack.Screen
          name="shipping-address"
          options={{
            header: BackHeader,
            title: t("navigation.shippingAddress"),
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
