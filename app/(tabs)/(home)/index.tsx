import { HomeHeader } from "@/components/Headers/HomeHeader";
import { PetAvatarList } from "@/components/PetAvatarList";
import { PetClinicList } from "@/components/PetClinicList";
import { PetProfileCard } from "@/components/PetProfileCard";
import { Tabs } from "@/components/Tabs";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";

export default function HomeScreen() {
  const tabs = [
    {
      title: "Profile",
      content: () => <PetProfileCard />,
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
