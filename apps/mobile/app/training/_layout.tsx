import { BackHeader } from "@/components/Headers/BackHeader";
import { ParamListBase, RouteProp } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
interface RouteParams {
  level: number;
}
export default function Layout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: BackHeader,
          title: t("training.title"),
        }}
      />
      <Stack.Screen
        name="[level]"
        options={(prop: {
          route: RouteProp<ParamListBase, string>;
          navigation: any;
        }) => {
          const { level } = prop.route.params as RouteParams;
          return {
            header: BackHeader,
            title: t("training.levelTitle", { level }),
          };
        }}
      />
    </Stack>
  );
}
