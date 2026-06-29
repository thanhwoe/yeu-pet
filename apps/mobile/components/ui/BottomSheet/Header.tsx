import { withIconClassName } from "@/hocs/withIconClassName";
import { ArrowLeftIcon as ArrowLeft, XIcon as X } from "phosphor-react-native";
import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TouchableOpacity, View } from "react-native";

const XIcon = withIconClassName(X);
const ArrowLeftIcon = withIconClassName(ArrowLeft);

interface BottomSheetHeaderProps {
  headerMode?: "back" | "close";
  handleSelectAndCloseOptions: () => void;
}

export const BottomSheetHeader = ({
  children,
  headerMode,
  handleSelectAndCloseOptions,
}: PropsWithChildren<BottomSheetHeaderProps>) => {
  const { t } = useTranslation();
  const handleDismiss = () => {
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      setTimeout(() => {
        handleSelectAndCloseOptions();
      }, 150);
    } else {
      handleSelectAndCloseOptions();
    }
  };
  return (
    <View className="h-[66px] px-8 flex-row items-center border-b border-line-secondary-inverse">
      {headerMode === "back" ? (
        <TouchableOpacity
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel={t("common.accessibility.goBack")}
          className="w-[50px] h-[50px] flex-row items-center justify-center"
        >
          <ArrowLeftIcon
            size={18}
            weight="bold"
            className="text-icon-primary"
          />
        </TouchableOpacity>
      ) : (
        <View className="w-[50px] h-[50px]" />
      )}
      <View className="flex-1 flex-row items-center justify-center gap-2">
        {children}
      </View>
      {headerMode === "close" ? (
        <TouchableOpacity
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel={t("common.accessibility.closeSheet")}
          className="w-[50px] h-[50px] flex-row items-center justify-center"
        >
          <XIcon size={18} weight="bold" className="text-icon-primary" />
        </TouchableOpacity>
      ) : (
        <View className="w-[50px] h-[50px]" />
      )}
    </View>
  );
};
