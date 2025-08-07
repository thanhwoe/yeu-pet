import { ServiceCard } from "@/components/ServiceCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useRouter } from "expo-router";
import {
  BarbellIcon,
  BellRingingIcon,
  ChatsIcon,
  FirstAidIcon,
  HairDryerIcon,
  NewspaperClippingIcon,
} from "phosphor-react-native";
import { View } from "react-native";

export default function Screen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View className="flex-row gap-4 pt-8 flex-wrap">
        <ServiceCard
          title="Clinic"
          subTitle="35+"
          icon={FirstAidIcon}
          iconColor="bg-amber-15"
          decoratorColor="text-amber-15"
          onPress={() => router.push("/list-clinic")}
        />
        <ServiceCard
          title="Grooming"
          subTitle="35+"
          icon={HairDryerIcon}
          iconColor="bg-blue-10"
          decoratorColor="text-blue-10"
        />
        <ServiceCard
          title="Training"
          subTitle="35+"
          icon={BarbellIcon}
          iconColor="bg-teal-20"
          decoratorColor="text-teal-20"
        />
        <ServiceCard
          title="Event"
          subTitle="35+"
          icon={NewspaperClippingIcon}
          iconColor="bg-yellow-10"
          decoratorColor="text-yellow-10"
        />
        <ServiceCard
          title="SOS"
          subTitle="Recuse"
          icon={BellRingingIcon}
          iconColor="bg-red-20"
          decoratorColor="text-red-20"
        />
        <ServiceCard
          title="Doctor AI"
          subTitle="(Experiment)"
          icon={ChatsIcon}
          iconColor="bg-lilac-15"
          decoratorColor="text-lilac-15"
        />
      </View>
    </ScreenContainer>
  );
}
