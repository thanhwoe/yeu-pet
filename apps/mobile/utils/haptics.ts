import * as ExpoHaptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticFeedback =
  | "selection"
  | "impactLight"
  | "impactMedium"
  | "impactHeavy"
  | "success"
  | "warning"
  | "error";

const runHaptic = (feedback: () => Promise<void>) => {
  if (Platform.OS === "web") {
    return;
  }

  try {
    void feedback().catch(() => {
      // Haptics can be unavailable on simulators, disabled devices, or some web/native shells.
    });
  } catch {
    // Keep haptics non-blocking even if a native shell throws synchronously.
  }
};

export const triggerHaptic = (feedback: HapticFeedback) => {
  switch (feedback) {
    case "selection":
      runHaptic(() => ExpoHaptics.selectionAsync());
      break;
    case "impactLight":
      runHaptic(() =>
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light),
      );
      break;
    case "impactMedium":
      runHaptic(() =>
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium),
      );
      break;
    case "impactHeavy":
      runHaptic(() =>
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy),
      );
      break;
    case "success":
      runHaptic(() =>
        ExpoHaptics.notificationAsync(
          ExpoHaptics.NotificationFeedbackType.Success,
        ),
      );
      break;
    case "warning":
      runHaptic(() =>
        ExpoHaptics.notificationAsync(
          ExpoHaptics.NotificationFeedbackType.Warning,
        ),
      );
      break;
    case "error":
      runHaptic(() =>
        ExpoHaptics.notificationAsync(
          ExpoHaptics.NotificationFeedbackType.Error,
        ),
      );
      break;
  }
};
