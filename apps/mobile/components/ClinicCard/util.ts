import { IClinic } from "@/interfaces";
import { date } from "@/utils";
import { Alert, Linking } from "react-native";
import { Toast } from "../Toast";

export const checkIsOpening = (data: IClinic) => {
  if (data.is_fulltime) {
    return data.is_fulltime;
  }
  const now = date();

  const todayOpen = date(data.open_time, "HH:mm");
  const todayClose = date(data.close_time, "HH:mm");
  return now.isBetween(todayOpen, todayClose, "minute", "[]");
};

export const makePhoneCall = async (phoneNumber?: string) => {
  if (!phoneNumber) {
    Toast.warn({ text: "No phone number available." });
    return;
  }
  const phoneUrl = `tel:${phoneNumber}`;
  try {
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
      return;
    }
    Alert.alert("Error", "Phone calls are not supported on this device");
  } catch (error) {
    console.error("Error making phone call:", error);
    Alert.alert("Error", "Failed to make phone call");
  }
};

export const sendSMS = async (phoneNumber?: string) => {
  if (!phoneNumber) {
    Toast.warn({ text: "No phone number available." });
    return;
  }
  const smsUrl = `sms:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(smsUrl);
    if (supported) {
      await Linking.openURL(smsUrl);
      return;
    }
    Alert.alert("Error", "SMS is not supported on this device");
  } catch (error) {
    console.error("Error sending SMS:", error);
    Alert.alert("Error", "Failed to open SMS");
  }
};

export const openSettings = () =>
  Alert.alert("Pet Land Would Like to Access the Location", "Description", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Setting", onPress: Linking.openSettings },
  ]);
