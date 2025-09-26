import { Spinner } from "@/components/ui/Spinner";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cva } from "class-variance-authority";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { TouchableOpacity } from "react-native";

const Icon = withIconClassName(PaperPlaneTiltIcon);

interface IProps {
  onPress: () => void;
  disabled?: boolean;
}

const variants = cva("p-3 bg-background-card rounded-full self-center", {
  variants: {
    disabled: {
      true: "opacity-50 bg-background-secondary",
      false: "",
    },
  },
});

export const SubmitButton = ({ onPress, disabled }: IProps) => {
  return (
    <TouchableOpacity
      className={variants({ disabled })}
      onPress={onPress}
      disabled={disabled}
    >
      {disabled ? (
        <Spinner className="text-icon-foreground" />
      ) : (
        <Icon className="text-icon-foreground" weight="bold" />
      )}
    </TouchableOpacity>
  );
};
