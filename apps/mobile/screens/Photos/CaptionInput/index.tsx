import { useColorScheme } from "@/hooks/useColorScheme";
import { cn } from "@/utils";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React from "react";
import { TextInputProps } from "react-native";

export interface ScalableTextInputProps
  extends TextInputProps {
  containerClassName?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const CaptionInput: React.FC<ScalableTextInputProps> = ({
  fullWidth = false,
  disabled = false,
  className,
  containerClassName,
  ...props
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      tint={colorScheme}
      className={cn(
        "items-center overflow-hidden rounded-16 border-hairline border-line-primary-inverse/40 px-12 py-8",
        fullWidth ? "w-full" : "w-244",
        disabled && "opacity-50",
        containerClassName,
      )}
    >
      <BottomSheetTextInput
        className={cn(
          "bg-transparent text-center text-body3-md text-text-primary-inverse",
          fullWidth && "w-full",
          className,
        )}
        editable={!disabled}
        autoFocus
        maxLength={80}
        autoComplete="off"
        autoCorrect={false}
        placeholderTextColor="rgba(255, 255, 255, 0.78)"
        {...props}
      />
    </BlurView>
  );
};
