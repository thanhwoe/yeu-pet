import { Popup } from "@/components/Popup";
import { ServiceCard } from "@/components/ServiceCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Href, useRouter } from "expo-router";
import {
  BarbellIcon,
  BellRingingIcon,
  ChatsIcon,
  CoinsIcon,
  FilesIcon,
  HairDryerIcon,
  ImagesIcon,
  NewspaperClippingIcon,
  Icon as PhosphorIcon,
} from "phosphor-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

type ServiceModule = {
  titleKey: string;
  subTitleKey: string;
  icon: PhosphorIcon;
  themeClassName: string;
  route?: Href;
};

const SERVICE_MODULES: ServiceModule[] = [
  {
    titleKey: "serviceLauncher.modules.medicalRecord.title",
    subTitleKey: "serviceLauncher.modules.medicalRecord.subtitle",
    icon: FilesIcon,
    themeClassName: "text-accent-orange",
    route: "/medical-record",
  },
  {
    titleKey: "serviceLauncher.modules.budget.title",
    subTitleKey: "serviceLauncher.modules.budget.subtitle",
    icon: CoinsIcon,
    themeClassName: "text-accent-yellow",
    route: "/budget",
  },
  {
    titleKey: "serviceLauncher.modules.photosSocial.title",
    subTitleKey: "serviceLauncher.modules.photosSocial.subtitle",
    icon: ImagesIcon,
    themeClassName: "text-accent-pink",
    route: "/photos",
  },
  {
    titleKey: "serviceLauncher.modules.doctorAi.title",
    subTitleKey: "serviceLauncher.modules.doctorAi.subtitle",
    icon: ChatsIcon,
    themeClassName: "text-accent-blue",
    route: "/doctor-ai",
  },
  {
    titleKey: "serviceLauncher.modules.groomingClinic.title",
    subTitleKey: "serviceLauncher.modules.groomingClinic.subtitle",
    icon: HairDryerIcon,
    themeClassName: "text-accent-purple",
  },
  {
    titleKey: "serviceLauncher.modules.training.title",
    subTitleKey: "serviceLauncher.modules.training.subtitle",
    icon: BarbellIcon,
    themeClassName: "text-accent-teal",
  },
  {
    titleKey: "serviceLauncher.modules.events.title",
    subTitleKey: "serviceLauncher.modules.events.subtitle",
    icon: NewspaperClippingIcon,
    themeClassName: "text-accent-cyan",
  },
  {
    titleKey: "serviceLauncher.modules.sos.title",
    subTitleKey: "serviceLauncher.modules.sos.subtitle",
    icon: BellRingingIcon,
    themeClassName: "text-accent-red",
  },
];

export default function Screen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleServicePress = useCallback(
    (service: ServiceModule) => {
      if (service.route) {
        router.push(service.route);
        return;
      }

      setShowComingSoon(true);
    },
    [router],
  );

  return (
    <ScreenContainer scrollEnabled>
      <View className="flex-row gap-16 flex-wrap pt-safe-offset-8 px-18">
        {SERVICE_MODULES.map((service) => (
          <ServiceCard
            key={service.titleKey}
            title={t(service.titleKey)}
            subTitle={t(service.subTitleKey)}
            icon={service.icon}
            themeClassName={service.themeClassName}
            accessibilityLabel={t(service.titleKey)}
            accessibilityRole="button"
            onPress={() => handleServicePress(service)}
          />
        ))}
      </View>

      <Popup
        visible={showComingSoon}
        title={t("serviceLauncher.comingSoonTitle")}
        description={t("serviceLauncher.comingSoonDescription")}
        cancelLabel={t("serviceLauncher.gotIt")}
        onCancel={() => setShowComingSoon(false)}
      />
    </ScreenContainer>
  );
}
