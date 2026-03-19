import { useColorScheme } from "@/hooks/useColorScheme";
import { useInitialize } from "@/hooks/useInitialize";
import { themes } from "@/theme";
import { date, registerForPushNotificationsAsync } from "@/utils";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppLoader } from "../AppLoader";

export const Providers = ({ children }: Required<Children>) =>
  combineProviders(
    [
      SafeAreaProvider,
      QueryProvider,
      InitialProvider,
      GestureHandlerProvider,
      BottomSheetModalProvider,
    ],
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

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (!isInitialized) {
    return <AppLoader />;
  }

  return (
    <>
      <View style={[{ flex: 1 }, themes[colorScheme]]}>{children}</View>
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
