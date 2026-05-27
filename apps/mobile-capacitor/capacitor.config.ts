import type { CapacitorConfig } from "@capacitor/cli";

const appVariant = process.env.VITE_APP_VARIANT ?? "development";

const appIds: Record<string, string> = {
  development: "com.thanhwoe.petcare.dev",
  preview: "com.thanhwoe.petcare.preview",
  production: "com.thanhwoe.petcare",
};

const appNames: Record<string, string> = {
  development: "YeuPet Dev",
  preview: "YeuPet Preview",
  production: "YeuPet",
};

const config: CapacitorConfig = {
  appId: appIds[appVariant] ?? appIds.development,
  appName: appNames[appVariant] ?? appNames.development,
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
