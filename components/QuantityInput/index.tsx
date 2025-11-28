import { withIconClassName } from "@/hocs/withIconClassName";
import { MinusIcon, PlusIcon } from "phosphor-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";

const Minus = withIconClassName(MinusIcon);
const Plus = withIconClassName(PlusIcon);

interface IProps {
  value: number;
  onChange: (value: number) => void;
}
export const QuantityInput = ({ onChange, value }: IProps) => {
  const handleChange = (v: number) => {
    if (v < 0) {
      onChange(0);
      return;
    }
    if (v > 9999) {
      onChange(9999);
      return;
    }

    onChange(v);
  };

  return (
    <View className="flex-row bg-background-card-info items-center gap-2 px-2 rounded-full">
      <TouchableOpacity
        disabled={value <= 0}
        onPress={() => {
          handleChange(value - 1);
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
        className="placeholder:text-text-secondary w-10 text-center text-[14px] selection:text-text-link"
        autoComplete="off"
        autoCorrect={false}
        maxFontSizeMultiplier={20 / 16}
        maxLength={4}
        verticalAlign="middle"
        keyboardType="number-pad"
        value={value.toString()}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, "");
          handleChange(numericValue ? parseInt(numericValue, 10) : 0);
        }}
      />
      <TouchableOpacity onPress={() => handleChange(value + 1)} hitSlop={10}>
        <Plus
          size={12}
          weight="bold"
          className="text-icon-primary-foreground"
        />
      </TouchableOpacity>
    </View>
  );
};
