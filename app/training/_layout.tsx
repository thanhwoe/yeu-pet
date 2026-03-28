import { BackHeader } from "@/components/Headers/BackHeader";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { Stack } from "expo-router";
interface RouteParams {
  level: number;
}
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: BackHeader,
          title: "Training",
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
            title: `Level ${level}`,
          };
        }}
      />
    </Stack>
  );
}
