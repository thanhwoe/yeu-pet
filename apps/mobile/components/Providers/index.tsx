import {
  AI_KEY,
  NOTIFICATIONS_KEY,
  PHOTOS_KEY,
  REMINDER_KEY,
  SETTINGS_KEY,
  SITTER_BOOKING_KEY,
} from "@/constants/query-keys";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useInitialize } from "@/hooks/useInitialize";
import {
  getUserSettingsQuery,
  markNotificationReadMutation,
} from "@/services";
import {
  changeAppLanguage,
  detectDeviceLanguage,
  getCurrentLanguage,
} from "@/i18n";
import { useUserInfoStore } from "@/stores";
import { themes } from "@/theme";
import {
  isViewingForegroundNotificationTarget,
  normalizeForegroundNotification,
} from "@/utils";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Href,
  useGlobalSearchParams,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AppLoader } from "../AppLoader";
import { Toast } from "../Toast";

export const Providers = ({ children }: Required<Children>) =>
  combineProviders(
    [GestureHandlerProvider, SafeAreaProvider, QueryProvider, InitialProvider],
    children,
  );

type AllowedProvider =
  | React.FC<Children>
  | React.ComponentClass<Children>
  | React.ComponentType
  | React.ForwardRefExoticComponent<any>;
type FilteredOutProvider = false | undefined;

type ProviderList = AllowedProvider[] | FilteredOutProvider[];

type Children = {
  children: React.ReactNode;
};

export const combineProviders = (
  list: ProviderList,
  children: Required<Children["children"]>,
) =>
  (
    list
      // filter out falsy items
      .filter(Boolean) as AllowedProvider[]
  ).reduceRight((acc, Provider) => <Provider>{acc}</Provider>, <>{children}</>);

const InitialProvider = ({ children }: Children) => {
  const isInitialized = useInitialize();
  const { t } = useTranslation();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const tokens = useUserInfoStore.use.tokens();
  const hasSession = Boolean(tokens?.accessToken);
  const themeVariables = themes[colorScheme] ?? themes.light;
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { bookingId, role, tab } = useGlobalSearchParams<{
    bookingId?: string;
    role?: string;
    tab?: string;
  }>();
  const currentRouteRef = useRef({
    pathname,
    segments,
    searchParams: { bookingId, role, tab },
  });
  const receivedNotificationIdsRef = useRef(new Set<string>());
  const { data: userSettings } = useQuery({
    queryKey: SETTINGS_KEY.detail(),
    queryFn: getUserSettingsQuery,
    enabled: isInitialized && hasSession,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    currentRouteRef.current = {
      pathname,
      segments,
      searchParams: { bookingId, role, tab },
    };
  }, [bookingId, pathname, role, segments, tab]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const nextLanguage = hasSession
      ? userSettings?.language ?? getCurrentLanguage()
      : detectDeviceLanguage();

    void changeAppLanguage(nextLanguage);
  }, [hasSession, isInitialized, userSettings?.language]);

  useEffect(() => {
    return onMessage(getMessaging(), (message) => {
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_KEY.all,
      });

      const notification = normalizeForegroundNotification(message);
      if (!notification) {
        return;
      }

      if (notification.category === "reminder") {
        void queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      }

      if (notification.category === "booking") {
        void queryClient.invalidateQueries({
          queryKey: SITTER_BOOKING_KEY.all,
        });
      }

      if (notification.category === "social") {
        void queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.all });
      }

      if (notification.category === "ai") {
        void queryClient.invalidateQueries({ queryKey: AI_KEY.all });
      }

      if (notification.id) {
        if (receivedNotificationIdsRef.current.has(notification.id)) {
          return;
        }

        if (receivedNotificationIdsRef.current.size >= 100) {
          const oldestId = receivedNotificationIdsRef.current
            .values()
            .next().value;
          if (oldestId) {
            receivedNotificationIdsRef.current.delete(oldestId);
          }
        }
        receivedNotificationIdsRef.current.add(notification.id);
      }

      if (
        isViewingForegroundNotificationTarget({
          notification,
          ...currentRouteRef.current,
        })
      ) {
        return;
      }

      Toast.notification({
        title: notification.title,
        text: notification.message,
        notificationType: notification.category,
        accessibilityLabel: `${notification.title}. ${notification.message}`,
        accessibilityHint: notification.deepLink
          ? t("toast.notificationHint")
          : undefined,
        onPress: notification.deepLink
          ? () => {
              if (notification.notificationId) {
                void markNotificationReadMutation(notification.notificationId)
                  .then(() =>
                    queryClient.invalidateQueries({
                      queryKey: NOTIFICATIONS_KEY.all,
                    }),
                  )
                  .catch(() => undefined);
              }
              router.push(notification.deepLink as Href);
            }
          : undefined,
      });
    });
  }, [router, t]);

  if (!isInitialized) {
    return <AppLoader />;
  }

  return (
    <>
      <View style={[{ flex: 1 }, themeVariables]}>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        <Toast />
      </View>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />
    </>
  );
};

const GestureHandlerProvider = ({ children }: Children) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    {children}
  </GestureHandlerRootView>
);

const queryClient = new QueryClient();
const QueryProvider = ({ children }: Children) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
