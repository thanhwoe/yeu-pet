import { ViewStyle } from "react-native";

export const nativeShadows = {
  card: {
    shadowColor: "#582B08",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  floating: {
    shadowColor: "#582B08",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  tabBar: {
    shadowColor: "#582B08",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
} satisfies Record<string, ViewStyle>;

export default {
  none: "none",
  sm: "0 2px 6px 0 rgba(88, 43, 8, 0.08)",
  DEFAULT: "0 4px 12px 0 rgba(88, 43, 8, 0.1)",
  md: "0 8px 18px -4px rgba(88, 43, 8, 0.14)",
  lg: "0 14px 28px -8px rgba(88, 43, 8, 0.16)",
  xl: "0 20px 36px -12px rgba(88, 43, 8, 0.18)",
  "2xl": "0 28px 56px -18px rgba(88, 43, 8, 0.22)",
  card: "0 8px 20px -8px rgba(88, 43, 8, 0.14)",
  sheet: "0 -8px 28px -14px rgba(88, 43, 8, 0.2)",
  floating: "0 16px 36px -14px rgba(88, 43, 8, 0.22)",
  inner: "inset 0 1px 2px 0 rgba(255, 255, 255, 0.28)",
};
