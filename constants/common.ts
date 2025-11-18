import * as Device from "expo-device";
import { Platform } from "react-native";

export const ENV = {
  API_URL:
    __DEV__ && Platform.OS === "ios" && !Device.isDevice
      ? "http://localhost:8787/api"
      : "https://pet-land-api.thanhwoe.workers.dev/api",
  GEMINI_API_KEY: "AIzaSyCE0ThLoZmmu-h6-P7aFuewvB19RjFIlZY",
};

// export const ENV = {
//   API_URL: "https://pet-land-api.thanhwoe.workers.dev/api",
//   GEMINI_API_KEY: "AIzaSyCE0ThLoZmmu-h6-P7aFuewvB19RjFIlZY",
// };
