import { useColorScheme } from "@/hooks/useColorScheme";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cva, type VariantProps } from "class-variance-authority";
import { BlurView } from "expo-blur";
import React, { useRef } from "react";
import { TextInputProps } from "react-native";

// Text input variants using class-variance-authority
const textInputVariants = cva(
  "bg-transparent text-text-primary-inverse placeholder:text-text-secondary-inverse selection:text-text-link",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500",
        primary: "border-blue-300 focus:border-blue-600",
        secondary: "border-gray-400 focus:border-gray-600",
        success: "border-green-300 focus:border-green-600",
        danger: "border-red-300 focus:border-red-600",
        ghost: "border-transparent focus:border-gray-400",
      },
      size: {
        sm: "text-sm py-1 px-2",
        md: "text-base leading-5",
        lg: "text-lg py-3 px-4",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "opacity-50 bg-gray-100",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      disabled: false,
    },
  }
);

const containerVariants = cva("flex items-center", {
  variants: {
    fullWidth: {
      true: "w-full",
      false: "inline-flex",
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export interface ScalableTextInputProps
  extends VariantProps<typeof textInputVariants>,
    TextInputProps {
  containerClassName?: string;
}

export const CaptionInput: React.FC<ScalableTextInputProps> = ({
  variant = "default",
  size = "md",
  fullWidth = false,
  disabled = false,
  className,
  containerClassName,
  style,
  ...props
}) => {
  const textInputRef = useRef<any>(null);
  const { colorScheme } = useColorScheme();

  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      tint={colorScheme}
      className={containerVariants({
        fullWidth,
        className: containerClassName,
      })}
    >
      <BottomSheetTextInput
        ref={textInputRef}
        className={textInputVariants({
          variant,
          size,
          fullWidth,
          disabled,
          className,
        })}
        editable={!disabled}
        autoFocus
        maxLength={30}
        autoComplete="off"
        autoCorrect={false}
        {...props}
      />
    </BlurView>
  );
};
