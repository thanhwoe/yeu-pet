import {
  forwardRef,
  useCallback,
  useState,
  type ElementType,
  type Ref,
  type RefAttributes,
} from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { cn } from "@/utils";
import { Body } from "../Typography";
import { InputVariants, inputVariants, supportTextVariants } from "./styles";

type InputComponentProps = TextInputProps & RefAttributes<TextInput>;
type TextInputFocusHandler = NonNullable<TextInputProps["onFocus"]>;
type TextInputBlurHandler = NonNullable<TextInputProps["onBlur"]>;

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
  inputComponent?: ElementType<InputComponentProps>;
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
      inputComponent,
      style,
      ...props
    }: InputFieldProps,
    forwardedRef: Ref<TextInput>,
  ) => {
    const [focus, setFocus] = useState(false);
    const InputComponent = inputComponent ?? TextInput;

    const handleFocus = useCallback<TextInputFocusHandler>(
      (e) => {
        setFocus(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback<TextInputBlurHandler>(
      (e) => {
        setFocus(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const typing = focus && !!props.value;

    return (
      <View className={className}>
        {label && (
          <Body variant="body3" className="mb-8" weight="semiBold">
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
          <InputComponent
            autoComplete="off"
            autoCorrect={false}
            ref={forwardedRef}
            className={cn(
              "flex-1 self-stretch text-text-primary placeholder:text-text-tertiary selection:text-text-secondary font-regular text-body2",
              {
                "align-top": multiline,
              },
            )}
            onBlur={handleBlur}
            onFocus={handleFocus}
            multiline={multiline}
            editable={!disabled}
            maxFontSizeMultiplier={24 / 16}
            {...props}
            style={[
              Platform.OS === "android"
                ? multiline
                  ? styles.androidMultiline
                  : styles.androidSingleLine
                : undefined,
              style,
            ]}
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

const styles = StyleSheet.create({
  androidSingleLine: {
    includeFontPadding: false,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  androidMultiline: {
    includeFontPadding: false,
    paddingBottom: 0,
    paddingTop: 0,
    textAlignVertical: "top",
  },
});
