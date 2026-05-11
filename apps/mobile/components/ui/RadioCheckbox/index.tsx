import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, View } from "react-native";
import { Text } from "../Text";

const radioVariants = cva(
  "border-2 rounded-full items-center justify-center p-1",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        secondary: "",
        success: "",
        danger: "",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
      },
      checked: {
        true: "border-line-selected",
        false: "",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      disabled: false,
    },
  }
);

interface RadioItemProps extends VariantProps<typeof radioVariants> {
  checked: boolean;
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export const RadioCheckbox: React.FC<RadioItemProps> = ({
  checked,
  onPress,
  variant,
  size,
  label,
  disabled,
}) => {
  return (
    <Pressable
      className="items-center justify-center"
      onPress={onPress}
      disabled={disabled}
    >
      <View
        className={radioVariants({
          variant,
          size,
          disabled,
          checked,
        })}
      >
        {checked && (
          <View className="rounded-full bg-background-primary w-full h-full" />
        )}
      </View>
      <Text variant="subhead" disabled={disabled}>
        {label}
      </Text>
    </Pressable>
  );
};
