import { forwardRef, useCallback, useState, type Ref } from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from "react-native";

import { cn } from "@/utils";
import { Body } from "../Typography";
import { InputVariants, inputVariants, supportTextVariants } from "./styles";

export interface InputFieldProps
  extends TextInputProps, Omit<InputVariants, "multiline"> {
  className?: string;
  supportText?: string;
  label?: string;
  hasError?: boolean;
  errorMessage?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  inputClassName?: string;
}

export const InputField = forwardRef(
  (
    {
      className,
      supportText,
      label,
      hasError = false,
      errorMessage,
      prefix,
      suffix,
      variant,
      disabled,
      onFocus,
      onBlur,
      multiline,
      inputClassName,
      ...props
    }: InputFieldProps,
    forwardedRef: Ref<TextInput>,
  ) => {
    const [focus, setFocus] = useState(false);

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocus(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocus(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const typing = focus && !!props.value;

    return (
      <View className={className}>
        {label && (
          <Body variant="body3" className="mb-8">
            {label}
          </Body>
        )}
        <View
          className={cn(
            inputVariants({
              variant,
              typing,
              focus,
              hasError,
              disabled,
              multiline,
            }),
            inputClassName,
          )}
        >
          {prefix && <View>{prefix}</View>}
          <TextInput
            autoComplete="off"
            autoCorrect={false}
            ref={forwardedRef}
            className={cn(
              "flex-1 h-full text-text-primary placeholder:text-text-tertiary selection:text-text-secondary font-regular text-body2",
              {
                "text-text-tertiary-inverse": !focus,
                "align-top": multiline,
              },
            )}
            onBlur={handleBlur}
            onFocus={handleFocus}
            multiline={multiline}
            editable={!disabled}
            maxFontSizeMultiplier={24 / 16}
            {...props}
          />
          {suffix && <View>{suffix}</View>}
        </View>
        {supportText && (
          <Body
            variant="body4"
            className={supportTextVariants({ variant, hasError })}
          >
            {supportText}
          </Body>
        )}

        {errorMessage && (
          <Body variant="body4" className="mt-6 text-text-negative">
            {errorMessage}
          </Body>
        )}
      </View>
    );
  },
);

InputField.displayName = "InputField";
