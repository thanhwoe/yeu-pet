import { Spinner } from "@/components/ui/Spinner";
import { withIconClassName } from "@/hocs/withIconClassName";
import { nativeShadows } from "@/theme/shadows";
import { cva } from "class-variance-authority";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

const Icon = withIconClassName(PaperPlaneTiltIcon);

interface IProps {
  onPress: () => void;
  disabled?: boolean;
}

const variants = cva("self-center bg-background-primary", {
  variants: {
    disabled: {
      true: "opacity-60 bg-background-secondary",
      false: "",
    },
  },
});

export const SubmitButton = ({ onPress, disabled }: IProps) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      accessibilityLabel={t("photos.accessibility.upload")}
      accessibilityRole="button"
      activeOpacity={0.82}
      className={variants({
        disabled,
        className: "h-56 w-56 items-center justify-center rounded-full p-0",
      })}
      onPress={onPress}
      disabled={disabled}
      style={nativeShadows.card}
    >
      {disabled ? (
        <Spinner className="text-icon-primary-inverse" size={22} />
      ) : (
        <Icon size={24} className="text-icon-primary-inverse" weight="bold" />
      )}
    </TouchableOpacity>
  );
};
