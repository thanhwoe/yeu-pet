import { BottomActionWrapper } from "@/components/BottomActionWrapper";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import { ICartResponse } from "@/interfaces";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface IProps {
  loading?: boolean;
  cartSummary?: ICartResponse["summary"];
  hasSelectedItems?: boolean;
  onToggleSelectAll: (value: boolean) => void;
}

export const BottomActions = ({
  loading,
  cartSummary,
  hasSelectedItems,
  onToggleSelectAll,
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <BottomActionWrapper className="flex-row items-center">
      <Checkbox
        label={t("commerce.cart.selectAll")}
        defaultValue={cartSummary?.selected_all}
        key={String(cartSummary?.selected_all)}
        onChange={onToggleSelectAll}
        disabled={loading}
        labelClassName="text-text-secondary"
      />
      <View className="px-2 flex-1 items-end">
        <Text className="font-bold text-text-link">
          {cartSummary?.subtotal}đ
        </Text>
        <Text variant="body2" className="line-through text-text-secondary">
          {cartSummary?.total}đ
        </Text>
      </View>
      <Button
        disabled={!hasSelectedItems}
        loading={loading}
        onPress={() => router.push("/checkout")}
      >
        {t("commerce.cart.checkout")}
      </Button>
    </BottomActionWrapper>
  );
};
