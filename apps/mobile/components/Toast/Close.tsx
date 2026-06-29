import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { XIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, PressableProps, View } from "react-native";

const CloseIcon = withIconClassName(XIcon);

export const Close = (props: PressableProps) => {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={t("common.accessibility.dismissNotification")}
      accessibilityRole="button"
      hitSlop={8}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            "-mr-4 -mt-4 h-36 w-36 items-center justify-center rounded-full",
            {
              "bg-background-surface-muted": pressed,
            },
          )}
        >
          <CloseIcon size={16} weight="bold" className="text-icon-secondary" />
        </View>
      )}
    </Pressable>
  );
};
