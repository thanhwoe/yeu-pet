import { IClinic } from "@/interfaces";
import { date } from "@/utils";
import { Alert, Linking } from "react-native";

export const checkIsOpening = (data: IClinic) => {
  if (data.is_fulltime) {
    return data.is_fulltime;
  }
  const now = date();

  const todayOpen = date(data.open_time, "HH:mm");
  const todayClose = date(data.close_time, "HH:mm");
  return now.isBetween(todayOpen, todayClose, "minute", "[]");
};

export const makePhoneCall = (phoneNumber?: string) => {
  if (!phoneNumber) {
    // TODO: show error
    return;
  }
  const phoneUrl = `tel:${phoneNumber}`;
  Linking.canOpenURL(phoneUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Error", "Phone calls are not supported on this device");
      }
    })
    .catch((error) => {
      console.error("Error making phone call:", error);
      Alert.alert("Error", "Failed to make phone call");
    });
};

export const sendSMS = (phoneNumber?: string) => {
  if (!phoneNumber) {
    // TODO: show error
    return;
  }
  let smsUrl = `sms:${phoneNumber}`;

  Linking.canOpenURL(smsUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(smsUrl);
      } else {
        Alert.alert("Error", "SMS is not supported on this device");
      }
    })
    .catch((error) => {
      console.error("Error sending SMS:", error);
      Alert.alert("Error", "Failed to open SMS");
    });
};

export const openSettings = () =>
  Alert.alert("Pet Land Would Like to Access the Location", "Description", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Setting", onPress: Linking.openSettings },
  ]);
