import { Dimensions, Platform } from "react-native";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export const ENV = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Platform.select({
      ios: "http://localhost:3000/api/v1",
      android: "http://10.0.2.2:3000/api/v1",
      default: "http://localhost:3000/api/v1",
    }),
};
