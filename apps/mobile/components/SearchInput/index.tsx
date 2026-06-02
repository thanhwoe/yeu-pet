import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { isEmpty } from "lodash";
import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";
import { memo, useCallback, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  TextInput,
  TextInputFocusEventData,
  View,
} from "react-native";
import { inputStyles, searchStyles } from "./styles";

const MagnifyingGlass = withIconClassName(MagnifyingGlassIcon);
const X = withIconClassName(XIcon);

interface IProps {
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

export const SearchInput = memo<IProps>(
  ({
    onChange,
    autoFocus,
    className,
    defaultValue,
    disabled,
    error,
    onClear,
    placeholder,
    size,
    value: controlledValue,
    onFocus,
    onBlur,
  }) => {
    const [value, setValue] = useState(defaultValue || "");
    const [focus, setFocus] = useState(false);

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocus(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocus(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (newValue: string) => {
        !controlledValue && setValue(newValue);

        onChange?.(newValue);
      },
      [controlledValue, onChange]
    );

    const handleClear = useCallback(() => {
      handleChange("");
      onClear?.();
    }, [handleChange, onClear]);

    const inputValue = controlledValue ?? value;
    const typing = focus && !!inputValue;

    return (
      <View
        className={cn(
          searchStyles({ size, focus, typing, disabled, error, className })
        )}
      >
        <View className="p-3">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="text-icon-secondary"
          />
        </View>
        <TextInput
          className={cn(inputStyles({ size }))}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChangeText={handleChange}
          placeholder={placeholder}
          editable={!disabled}
          value={inputValue}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect={false}
          returnKeyType="done"
          maxFontSizeMultiplier={20 / 16}
        />
        {!isEmpty(inputValue) && (
          <Pressable className="p-3" onPress={handleClear}>
            <X size={18} weight="bold" />
          </Pressable>
        )}
      </View>
    );
  }
);

SearchInput.displayName = "SearchInput";
