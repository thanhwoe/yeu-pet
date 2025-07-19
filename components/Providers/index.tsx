import {
  useColorScheme,
  useInitialAndroidBarSync,
} from "@/hooks/useColorScheme";
import { NAV_THEME } from "@/theme";
import { date } from "@/utils";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LocaleConfig } from "react-native-calendars";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const Providers = ({ children }: Required<Children>) =>
  combineProviders(
    [
      SafeAreaProvider,
      InitialProvider,
      GestureHandlerProvider,
      BottomSheetModalProvider,
    ],
    children
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
  children: Required<Children["children"]>
) =>
  (
    list
      // filter out falsy items
      .filter(Boolean) as AllowedProvider[]
  ).reduceRight((acc, Provider) => <Provider>{acc}</Provider>, <>{children}</>);

const InitialProvider = ({ children }: Children) => {
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useInitialAndroidBarSync();
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

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  return (
    <>
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        {children}
      </NavThemeProvider>
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
