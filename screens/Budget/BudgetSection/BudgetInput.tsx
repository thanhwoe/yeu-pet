import { Button } from "@/components/ui/Button";
import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { TextInput, View } from "react-native";

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

  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();
  const handleFocus = () => {
    shouldHandleKeyboardEvents.value = true;
  };
  const handleBlur = () => {
    shouldHandleKeyboardEvents.value = false;
  };
  return (
    <View className="px-3 gap-4">
      <TextInput
        className="flex-1 border border-line-primary rounded-lg px-3 py-3"
        autoComplete="off"
        autoCorrect={false}
        keyboardType="numeric"
        placeholder="Enter amount"
        autoFocus
        defaultValue={defaultValue?.toLocaleString()}
        value={value.toLocaleString()}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, "");
          setValue(numericValue ? parseInt(numericValue, 10) : 0);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
