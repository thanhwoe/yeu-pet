import { Body } from "@/components/ui/Typography";
import { IMedicalRecord } from "@/interfaces";
import { cva } from "class-variance-authority";
import { View } from "react-native";

interface IProps {
  type: IMedicalRecord["recordType"];
}

const wrapperStyle = cva("px-12 py-6 rounded-18", {
  variants: {
    type: {
      vaccination: "bg-accent-cyan-foreground",
      checkup: "bg-accent-blue-foreground",
      surgery: "bg-accent-red-foreground",
      medication: "bg-accent-green-foreground",
    },
  },
});
const textStyle = cva("", {
  variants: {
    type: {
      vaccination: "text-accent-cyan-bold",
      checkup: "text-accent-blue-bold",
      surgery: "text-accent-red-bold",
      medication: "text-accent-green-bold",
    },
  },
});

export const MedicalRecordType = ({ type }: IProps) => {
  return (
    <View className={wrapperStyle({ type })}>
      <Body variant="body3" caps className={textStyle({ type })}>
        {type}
      </Body>
    </View>
  );
};
