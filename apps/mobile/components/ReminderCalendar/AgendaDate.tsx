import { date } from "@/utils";
import { SectionListData, View } from "react-native";
import { Body } from "../ui/Typography";

export const AgendaDate = ({
  section,
}: {
  section: SectionListData<unknown>;
}) => {
  const title = typeof section?.title === "string" ? section.title : "";

  return (
    <View className="bg-background py-8">
      <Body className="mb-2 text-text-link">{date(title).format("LL")}</Body>
    </View>
  );
};
