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
import { View } from "react-native";

const COMING_SOON_DESCRIPTION =
  "This feature is being developed and will be available in a future update.";

type ServiceModule = {
  title: string;
  subTitle: string;
  icon: PhosphorIcon;
  themeClassName: string;
  route?: Href;
};

const SERVICE_MODULES: ServiceModule[] = [
  {
    title: "Medical Record",
    subTitle: "Health records & medical images",
    icon: FilesIcon,
    themeClassName: "text-accent-orange",
    route: "/medical-record",
  },
  {
    title: "Budget",
    subTitle: "Track pet care expenses",
    icon: CoinsIcon,
    themeClassName: "text-accent-yellow",
    route: "/budget",
  },
  {
    title: "Photos Social",
    subTitle: "Share pet moments",
    icon: ImagesIcon,
    themeClassName: "text-accent-pink",
    route: "/photos",
  },
  {
    title: "Doctor AI",
    subTitle: "Ask pet-care questions",
    icon: ChatsIcon,
    themeClassName: "text-accent-blue",
    route: "/doctor-ai",
  },
  {
    title: "Grooming & Clinic",
    subTitle: "Book grooming and vet visits",
    icon: HairDryerIcon,
    themeClassName: "text-accent-purple",
  },
  {
    title: "Training",
    subTitle: "Learn care & training tips",
    icon: BarbellIcon,
    themeClassName: "text-accent-teal",
  },
  {
    title: "Events",
    subTitle: "Pet events and activities",
    icon: NewspaperClippingIcon,
    themeClassName: "text-accent-cyan",
  },
  {
    title: "SOS",
    subTitle: "Emergency help for pets",
    icon: BellRingingIcon,
    themeClassName: "text-accent-red",
  },
];

export default function Screen() {
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
            key={service.title}
            title={service.title}
            subTitle={service.subTitle}
            icon={service.icon}
            themeClassName={service.themeClassName}
            accessibilityLabel={service.title}
            accessibilityRole="button"
            onPress={() => handleServicePress(service)}
          />
        ))}
      </View>

      <Popup
        visible={showComingSoon}
        title="Coming soon"
        description={COMING_SOON_DESCRIPTION}
        cancelLabel="Got it"
        onCancel={() => setShowComingSoon(false)}
      />
    </ScreenContainer>
  );
}
