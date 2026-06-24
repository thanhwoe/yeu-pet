import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  LOG_LEVEL,
} from "react-native-purchases";

export const REVENUECAT_PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_RC_PREMIUM_ENTITLEMENT_ID || "Yeu Pet Pro";

let configurationPromise: Promise<boolean> | null = null;
let didLogMissingKey = false;

const getApiKey = () => {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_RC_APPLE_API_KEY;
  }

  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY;
  }

  return undefined;
};

export const configureRevenueCat = () => {
  if (configurationPromise) {
    return configurationPromise;
  }

  configurationPromise = (async () => {
    if (await Purchases.isConfigured()) {
      return true;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      if (!didLogMissingKey) {
        console.warn(
          `[RevenueCat] Missing public SDK key for ${Platform.OS}. Purchases are disabled.`,
        );
        didLogMissingKey = true;
      }
      return false;
    }

    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    Purchases.configure({ apiKey });
    return true;
  })().catch((error) => {
    configurationPromise = null;
    console.warn("[RevenueCat] SDK configuration failed.", error);
    return false;
  });

  return configurationPromise;
};

export const identifyRevenueCatUser = async (userId: string) => {
  if (!(await configureRevenueCat())) {
    return null;
  }

  try {
    const currentUserId = await Purchases.getAppUserID();
    if (currentUserId === userId) {
      return await Purchases.getCustomerInfo();
    }

    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.warn("[RevenueCat] Could not identify the signed-in user.", error);
    return null;
  }
};

export const getRevenueCatCustomerInfo = async () => {
  if (!(await configureRevenueCat())) {
    return null;
  }

  return Purchases.getCustomerInfo();
};

export const addRevenueCatCustomerInfoListener = (
  listener: CustomerInfoUpdateListener,
) => {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
};

export type { CustomerInfo };
