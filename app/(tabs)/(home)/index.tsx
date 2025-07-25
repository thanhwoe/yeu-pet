import { HomeHeader } from "@/components/Headers/HomeHeader";
import { PetAvatarList } from "@/components/PetAvatarList";
import { PetClinicList } from "@/components/PetClinicList";
import { PetInfoCardList } from "@/components/PetInfoCardList";
import { Tabs } from "@/components/Tabs";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";

export default function HomeScreen() {
  const tabs = [
    {
      title: "Profile",
      content: () => <PetInfoCardList />,
    },
    {
      title: "Records",
      content: () => <Text>Coming soon!</Text>,
    },
  ];

  return (
    <ScreenContainer>
      <HomeHeader />
      <PetAvatarList />
      <Tabs tabs={tabs} />
      <PetClinicList />
    </ScreenContainer>
  );
}
