import { withIconClassName } from "@/hocs/withIconClassName";
import { withUploadImage } from "@/hocs/withUploadImage";
import { cn } from "@/utils";
import { FileArrowUpIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Body } from "../ui/Typography";
import { DEFAULT_MAX_SIZE_MB } from "./utils";

const UploadIcon = withIconClassName(FileArrowUpIcon);

interface IProps {
  hasError?: boolean;
  onPress?: () => void;
  maxSizeMB?: number;
}

const UploadZoneField = ({
  onPress,
  hasError,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "border-2 border-dashed rounded-16 items-center justify-center gap-12 py-24 px-20",
        hasError ? "border-line-negative" : "border-line-secondary-inverse",
      )}
    >
      <View className="w-48 h-48 rounded-full bg-background-secondary-highlight items-center justify-center">
        <UploadIcon
          size={24}
          className="text-icon-primary-inverse"
          weight="bold"
        />
      </View>

      <View className="items-center gap-4">
        <Body weight="semiBold">
          {t("common.documents.uploadMedicalImages")}
        </Body>
        <Body variant="body4" className="text-text-tertiary">
          {t("common.documents.maxSize", { size: maxSizeMB })}
        </Body>
      </View>

      <View className="px-48  py-10 rounded-12 bg-background-secondary w-full items-center">
        <Body variant="body3" className="text-text-secondary">
          {t("common.documents.browseFiles")}
        </Body>
      </View>
    </Pressable>
  );
};

export const ZoneUploader = withUploadImage(UploadZoneField);
