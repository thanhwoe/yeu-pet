import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { useState } from "react";
import { View } from "react-native";

const EnhancedInputField = withBottomSheetKeyboardEvents(InputField);

interface BudgetInputProps {
  onSubmit: (value: number) => void;
  isLoading?: boolean;
  defaultValue?: number;
}
export const BudgetInput = ({
  onSubmit,
  isLoading,
  defaultValue,
}: BudgetInputProps) => {
  const [value, setValue] = useState<number>(defaultValue ?? 0);

  return (
    <View className="px-20 gap-24">
      <EnhancedInputField
        autoComplete="off"
        autoCorrect={false}
        className="h-50"
        keyboardType="numeric"
        placeholder="Enter amount"
        autoFocus
        defaultValue={defaultValue?.toLocaleString()}
        value={value.toLocaleString()}
        onChangeText={(text: string) => {
          const numericValue = text.replace(/[^0-9]/g, "");
          setValue(numericValue ? parseInt(numericValue, 10) : 0);
        }}
      />

      <Button
        disabled={!value || isLoading}
        onPress={() => onSubmit(value ?? 0)}
      >
        Submit
      </Button>
    </View>
  );
};
