import { withIconClassName } from "@/hocs/withIconClassName";
import { CaretDownIcon } from "phosphor-react-native";
import { ReactNode, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, TextInputProps } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { InputField } from "../ui/InputField";
import { Options } from "../ui/Options";
import { Body } from "../ui/Typography";

const OptionIcon = withIconClassName(CaretDownIcon);

interface InputControllerProps<T extends FieldValues, TTransformedValues = T>
  extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T, any, TTransformedValues>;
  rules?: RegisterOptions<T>;
  options: { label: string; value: string; icon?: ReactNode }[];
}

export const OptionInputController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
  name,
  control,
  rules,
  label,
  options,
  ...props
}: InputControllerProps<T, TTransformedValues>) => {
  const { t } = useTranslation();
  const {
    field: { value: defaultValue, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const defaultLabel = options.find(
    (item) => item.value === defaultValue,
  )?.label;

  const [value, setValue] = useState(defaultLabel ?? "");
  const [showOptions, setShowOptions] = useState(false);

  const handleSelect = (data: (typeof options)[0]) => {
    onChange(data.value);
    setValue(data.label);
    setShowOptions(false);
    onBlur();
  };

  const handleShowOption = () => {
    setShowOptions(true);
    Keyboard.dismiss();
  };

  return (
    <>
      <InputField
        className="flex-1"
        label={label}
        defaultValue={defaultValue}
        value={value}
        onBlur={onBlur}
        onPress={handleShowOption}
        editable={false}
        errorMessage={error?.message}
        hasError={!!error?.message}
        suffix={
          <Pressable onPress={handleShowOption}>
            <OptionIcon className="text-icon-primary" />
          </Pressable>
        }
        {...props}
      />

      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        titleElement={
          <Body weight="semiBold">{t("common.selectValue", { label })}</Body>
        }
        useScrollView
        stackBehavior="push"
      >
        <Options
          data={options}
          selected={defaultValue}
          onSelect={handleSelect}
        />
      </BottomSheet>
    </>
  );
};
