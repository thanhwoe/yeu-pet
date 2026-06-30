import { Body } from "@/components/ui/Typography";
import { IMedicalRecord } from "@/interfaces";
import { cva } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface MedicalRecordStatusChipProps {
  status: IMedicalRecord["attachmentStatus"];
}

const wrapperStyle = cva("self-start rounded-full border px-10 py-5", {
  variants: {
    status: {
      ready: "border-status-success-border bg-status-success-surface",
      processing: "border-status-warning-border bg-status-warning-surface",
      failed: "border-status-danger-border bg-status-danger-surface",
    },
  },
});

const textStyle = cva("font-semiBold", {
  variants: {
    status: {
      ready: "text-status-success-text",
      processing: "text-status-warning-text",
      failed: "text-status-danger-text",
    },
  },
});

export const MedicalRecordStatusChip = ({
  status,
}: MedicalRecordStatusChipProps) => {
  const { t } = useTranslation();

  return (
    <View className={wrapperStyle({ status })}>
      <Body variant="body5" className={textStyle({ status })}>
        {t(`medicalRecords.status.${status}`)}{" "}
      </Body>
    </View>
  );
};
