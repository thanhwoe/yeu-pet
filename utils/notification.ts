import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "notification.wav",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

// export const schedulePushNotification = async (payload: IReminderResponse) => {
//   if (!Device.isDevice) {
//     return;
//   }

//   try {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: payload.title,
//         body: payload.description,
//         sound: "notification.wav",
//         subtitle: getReminderEmoji(payload.type),
//       },
//       trigger: {
//         date: new Date(payload.event_date),
//         type: Notifications.SchedulableTriggerInputTypes.DATE,
//       },
//       identifier: payload.id,
//     });
//   } catch (error) {
//     // TODO: log sentry
//     Toast.error({ text: "Error scheduling notification" });
//   }
// };

// export const updateSchedulePushNotification = async (
//   payload: IReminderResponse,
// ) => {
//   if (!Device.isDevice) {
//     return;
//   }

//   try {
//     await Notifications.cancelScheduledNotificationAsync(payload.id);

//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: payload.title,
//         body: payload.description,
//         sound: "notification.wav",
//         subtitle: getReminderEmoji(payload.type),
//       },
//       trigger: {
//         date: new Date(payload.event_date),
//         type: Notifications.SchedulableTriggerInputTypes.DATE,
//       },
//       identifier: payload.id,
//     });
//   } catch (error) {
//     // TODO: log sentry
//     Toast.error({ text: "Error updating notification" });
//   }
// };

// export const cancelSchedulePushNotification = async (
//   payload: IReminderResponse,
// ) => {
//   if (!Device.isDevice) {
//     return;
//   }

//   try {
//     await Notifications.cancelScheduledNotificationAsync(payload.id);
//   } catch (error) {
//     // TODO: log sentry
//     Toast.error({ text: "Error canceling notification" });
//   }
// };

// const getReminderEmoji = (category: string) => {
//   switch (category) {
//     case "medication":
//       return "💊";
//     case "vaccination":
//       return "💉";
//     case "feed":
//       return "🦴";
//     case "grooming":
//       return "✂️";
//     default:
//       return "🔔";
//   }
// };
