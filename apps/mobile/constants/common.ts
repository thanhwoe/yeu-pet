import { Platform } from "react-native";

// export const ENV = {
//   API_URL:
//     __DEV__ && Platform.OS === "ios" && !Device.isDevice
//       ? "http://localhost:8787/api"
//       : "https://pet-land-api.thanhwoe.workers.dev/api",
//   GEMINI_API_KEY: "AIzaSyCE0ThLoZmmu-h6-P7aFuewvB19RjFIlZY",
// };

export const ENV = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Platform.select({
      ios: "http://localhost:3000/api/v1",
      android: "http://10.0.2.2:3000/api/v1",
      default: "http://localhost:3000/api/v1",
    }),
  GEMINI_API_KEY:
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    "AIzaSyCE0ThLoZmmu-h6-P7aFuewvB19RjFIlZY",
};
