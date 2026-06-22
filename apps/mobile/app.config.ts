import type { ConfigContext, ExpoConfig } from "expo/config";

type Variant = "development" | "preview" | "production";
type Values = {
  name: string;
  bundleIdentifier: string;
  package: string;
};

const VARIANTS: Record<Variant, Values> = {
  production: {
    name: "YeuPet",
    bundleIdentifier: "com.thanhwoe.petcare",
    package: "com.thanhwoe.petcare",
  },
  development: {
    name: "YeuPet Dev",
    bundleIdentifier: "com.thanhwoe.petcare.dev",
    package: "com.thanhwoe.petcare.dev",
  },
  preview: {
    name: "YeuPet Preview",
    bundleIdentifier: "com.thanhwoe.petcare.preview",
    package: "com.thanhwoe.petcare.preview",
  },
};
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = (process.env.APP_VARIANT as Variant) || "production";
  const androidGoogleServicesFile =
    process.env.FIREBASE_ANDROID_GOOGLE_SERVICES_FILE;
  const iosGoogleServicesFile = process.env.FIREBASE_IOS_GOOGLE_SERVICES_FILE;

  const value = VARIANTS[variant];

  return {
    ...config,
    // EAS Update only ships iOS/Android bundles; omit web so `expo export` skips it in CI.
    platforms: ["ios", "android"],
    slug: "pet-care",
    name: value.name,
    ios: {
      ...config.ios,
      bundleIdentifier: value.bundleIdentifier,
      googleServicesFile:
        iosGoogleServicesFile ?? config.ios?.googleServicesFile,
      entitlements: {
        ...config.ios?.entitlements,
        "aps-environment":
          variant === "development" ? "development" : "production",
      },
    },
    android: {
      ...config.android,
      package: value.package,
      googleServicesFile:
        androidGoogleServicesFile ?? config.android?.googleServicesFile,
    },
  };
};
