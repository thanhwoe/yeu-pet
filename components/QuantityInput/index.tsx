import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { MinusIcon, PlusIcon } from "phosphor-react-native";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const Minus = withIconClassName(MinusIcon);
const Plus = withIconClassName(PlusIcon);

const wrapperVariants = cva("flex-row items-center rounded-md", {
  variants: {
    swarthy: {
      true: "bg-grey-10",
      false: "bg-background-card-info",
    },
    size: {
      sm: "gap-1 px-1 w-20 h-5",
      lg: "gap-2 px-2 w-24",
    },
  },
  defaultVariants: {
    swarthy: false,
    size: "lg",
  },
});

type InputVariant = VariantProps<typeof wrapperVariants>;

interface IProps extends InputVariant {
  value?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}
export const QuantityInput = ({
  onChange,
  value: controlledValue,
  defaultValue = 0,
  size,
  swarthy,
  className,
  min = 0,
  max = 9999,
  disabled,
}: IProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (v: number) => {
    let newValue = v;

    if (v < min) {
      newValue = min;
    } else if (v > max) {
      newValue = max;
    }

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Always call onChange
    onChange(newValue);
  };

  return (
    <View className={cn(wrapperVariants({ swarthy, size, className }))}>
      <TouchableOpacity
        disabled={value <= min || disabled}
        onPress={() => {
          handleChange(value - 1);
        }}
        style={{
          opacity: value <= min ? 0.5 : 1,
        }}
        hitSlop={10}
      >
        <Minus
          size={12}
          weight="bold"
          className="text-icon-primary-foreground"
        />
      </TouchableOpacity>

      <TextInput
        className="placeholder:text-text-secondary flex-1 text-[14px] text-center selection:text-text-link"
        autoComplete="off"
        autoCorrect={false}
        style={{
          paddingTop: 0,
          paddingBottom: 0,
        }}
        maxFontSizeMultiplier={20 / 16}
        maxLength={4}
        verticalAlign="middle"
        keyboardType="number-pad"
        value={String(value)}
        editable={!disabled}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, "");
          handleChange(numericValue ? parseInt(numericValue, 10) : 0);
        }}
      />

      <TouchableOpacity
        disabled={value >= max || disabled}
        onPress={() => handleChange(value + 1)}
        hitSlop={10}
        style={{
          opacity: value >= max ? 0.5 : 1,
        }}
      >
        <Plus
          size={12}
          weight="bold"
          className="text-icon-primary-foreground"
        />
      </TouchableOpacity>
    </View>
  );
};
