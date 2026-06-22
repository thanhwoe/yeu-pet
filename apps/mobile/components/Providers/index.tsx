import { useColorScheme } from "@/hooks/useColorScheme";
import { useInitialize } from "@/hooks/useInitialize";
import { themes } from "@/theme";
import { date } from "@/utils";
import {
  NOTIFICATIONS_KEY,
  REMINDER_KEY,
  SITTER_BOOKING_KEY,
} from "@/constants/query-keys";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const themeVariables = themes[colorScheme] ?? themes.light;

  useEffect(() => {
    date.locale("vi");
    LocaleConfig.locales["default"] = {
      monthNames: date.months(),
      monthNamesShort: date.months(),
      dayNames: date.weekdays(),
      dayNamesShort: date.weekdaysShort(),
      today: "Hôm nay",
    };

    LocaleConfig.defaultLocale = "default";
  }, []);

  useEffect(() => {
    return onMessage(getMessaging(), (message) => {
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_KEY.all,
      });

      const notificationType = message.data?.notificationType;
      if (notificationType === "reminder_due") {
        void queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      }

      if (
        notificationType === "sitter_booking_request" ||
        notificationType === "sitter_booking_status"
      ) {
        void queryClient.invalidateQueries({
          queryKey: SITTER_BOOKING_KEY.all,
        });
      }

      if (message.notification?.title || message.notification?.body) {
        Toast.show({
          title: message.notification.title,
          text: message.notification.body ?? "You have a new notification.",
          duration: 4000,
        });
      }
    });
  }, []);

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
