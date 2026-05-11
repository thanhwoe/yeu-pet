import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { Check, Minus } from "phosphor-react-native";
import { useState, type FC } from "react";
import { Pressable, View, type PressableProps } from "react-native";
import { Text } from "../Text";
import { checkboxStyles, wrapperStyles, type CheckboxVariant } from "./styles";

const CheckIcon = withIconClassName(Check);
const MinusIcon = withIconClassName(Minus);

interface IProps extends CheckboxVariant, PressableProps {
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  defaultValue?: boolean;
}

export const Checkbox: FC<IProps> = ({
  checked: controlledChecked,
  size = "medium",
  reverse,
  disabled,
  indeterminate,
  onChange,
  label,
  icon,
  className,
  checkboxClassName,
  children,
  labelClassName,
  defaultValue,
  ...props
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultValue ?? false);

  // Determine if component is controlled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = () => {
    const newValue = !checked;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalChecked(newValue);
    }

    // Call onChange callback
    onChange?.(newValue);
  };
  return (
    <Pressable onPress={handleChange} disabled={disabled} {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            wrapperStyles({ checked, pressed, reverse }),
            className
          )}
        >
          <View
            className={cn(
              checkboxStyles({ checked, size, disabled }),
              checkboxClassName
            )}
          >
            {checked ? (
              indeterminate ? (
                <MinusIcon
                  className="text-icon-foreground"
                  size={size === "medium" ? 16 : 11}
                  weight="bold"
                />
              ) : (
                <CheckIcon
                  className="text-icon-foreground"
                  size={size === "medium" ? 16 : 11}
                  weight="bold"
                />
              )
            ) : null}
          </View>
          {label ? (
            <Text variant="footnote" className={labelClassName}>
              {label}
            </Text>
          ) : (
            <>{children}</>
          )}
          {icon}
        </View>
      )}
    </Pressable>
  );
};
