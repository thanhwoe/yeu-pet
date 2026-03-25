import { ServiceCard } from "@/components/ServiceCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useRouter } from "expo-router";
import {
  BarbellIcon,
  BellRingingIcon,
  ChatsIcon,
  CoinsIcon,
  FilesIcon,
  HairDryerIcon,
  ImagesIcon,
  NewspaperClippingIcon,
} from "phosphor-react-native";
import { View } from "react-native";

export default function Screen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollEnabled>
      <View className="flex-row gap-16 flex-wrap pt-safe-offset-8 px-18">
        <ServiceCard
          title="Medical Record"
          subTitle="35+"
          icon={FilesIcon}
          themeClassName="text-accent-orange"
        />

        <ServiceCard
          title="Budget"
          // Quản lý chi tiêu
          subTitle="Budget statistics"
          icon={CoinsIcon}
          themeClassName="text-accent-yellow"
          onPress={() => router.push("/budget")}
        />
        <ServiceCard
          title="Photos Social"
          subTitle="Share your pet photos"
          icon={ImagesIcon}
          themeClassName="text-accent-pink"
          onPress={() => router.push("/photos")}
        />

        <ServiceCard
          title="Doctor AI"
          subTitle="Tư vấn sức khỏe"
          icon={ChatsIcon}
          themeClassName="text-accent-blue"
        />
        <ServiceCard
          title="Grooming & Clinic"
          subTitle="35+"
          icon={HairDryerIcon}
          themeClassName="text-accent-purple"
        />
        <ServiceCard
          title="Training"
          subTitle="35+"
          icon={BarbellIcon}
          themeClassName="text-accent-teal"
        />
        <ServiceCard
          title="Events"
          subTitle="35+"
          icon={NewspaperClippingIcon}
          themeClassName="text-accent-cyan"
        />
        <ServiceCard
          title="SOS"
          subTitle="Recuse"
          icon={BellRingingIcon}
          themeClassName="text-accent-red"
        />
        {/* <ServiceCard
          title="Store"
          icon={StorefrontIcon}
          themeClassName="text-accent-green"
        /> */}
      </View>
    </ScreenContainer>
  );
}
