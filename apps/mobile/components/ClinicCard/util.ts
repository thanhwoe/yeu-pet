import { IClinic } from "@/interfaces";
import { i18n } from "@/i18n";
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
    Toast.warn({
      title: i18n.t("common.contact.missingPhoneTitleCall"),
      text: i18n.t("common.contact.missingPhoneText", {
        place: i18n.t("common.places.clinic"),
      }),
    });
    return;
  }
  const phoneUrl = `tel:${phoneNumber}`;
  try {
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
      return;
    }
    Alert.alert(
      i18n.t("common.contact.errorTitle"),
      i18n.t("common.contact.callUnsupportedMessage"),
    );
  } catch (error) {
    console.error("Error making phone call:", error);
    Alert.alert(
      i18n.t("common.contact.errorTitle"),
      i18n.t("common.contact.callFailedMessage"),
    );
  }
};

export const sendSMS = async (phoneNumber?: string) => {
  if (!phoneNumber) {
    Toast.warn({
      title: i18n.t("common.contact.missingPhoneTitleMessage"),
      text: i18n.t("common.contact.missingPhoneText", {
        place: i18n.t("common.places.clinic"),
      }),
    });
    return;
  }
  const smsUrl = `sms:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(smsUrl);
    if (supported) {
      await Linking.openURL(smsUrl);
      return;
    }
    Alert.alert(
      i18n.t("common.contact.errorTitle"),
      i18n.t("common.contact.messageUnsupportedMessage"),
    );
  } catch (error) {
    console.error("Error sending SMS:", error);
    Alert.alert(
      i18n.t("common.contact.errorTitle"),
      i18n.t("common.contact.messageFailedMessage"),
    );
  }
};

export const openSettings = () =>
  Alert.alert(
    i18n.t("common.permission.locationTitle"),
    i18n.t("common.permission.locationDescription"),
    [
      {
        text: i18n.t("common.cancel"),
        style: "cancel",
      },
      { text: i18n.t("common.settings"), onPress: Linking.openSettings },
    ],
  );
