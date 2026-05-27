const appVariant = import.meta.env.VITE_APP_VARIANT ?? "development";

function resolveApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:3000/api/v1";
}

export const env = {
  apiUrl: resolveApiUrl(),
  appVariant: appVariant as "development" | "preview" | "production",
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  isNative: typeof window !== "undefined" && "Capacitor" in window,
} as const;
