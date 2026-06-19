import { Body } from "@/components/ui/Typography";
import { IMedicalRecord } from "@/interfaces";
import { cva } from "class-variance-authority";
import { View } from "react-native";

interface IProps {
  type: IMedicalRecord["recordType"];
}

const TYPE_LABEL: Record<IMedicalRecord["recordType"], string> = {
  vaccination: "Vaccination",
  checkup: "Checkup",
  surgery: "Surgery",
  medication: "Medication",
};

const wrapperStyle = cva("self-start rounded-full border px-10 py-5", {
  variants: {
    type: {
      vaccination: "border-line-info bg-accent-cyan",
      checkup: "border-line-info bg-accent-blue",
      surgery: "border-line-negative bg-accent-red",
      medication: "border-line-positive bg-accent-green",
    },
  },
});
const textStyle = cva("font-semiBold", {
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
      <Body variant="body5" className={textStyle({ type })}>
        {TYPE_LABEL[type]}
      </Body>
    </View>
  );
};
