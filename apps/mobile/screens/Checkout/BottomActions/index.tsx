import { BottomActionWrapper } from "@/components/BottomActionWrapper";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/Skeleton";
import { Text } from "@/components/ui/Text";
import { IOrderSummaryResponse } from "@/interfaces";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface IProps {
  data?: IOrderSummaryResponse["data"]["summary"];
  loading?: boolean;
  disabled?: boolean;
  onPlaceOrder?: (amount: number) => void;
}

export const BottomActions = ({
  data,
  loading,
  onPlaceOrder,
  disabled,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <BottomActionWrapper>
      <View className="flex-row justify-between">
        <Text className="font-semibold">{t("commerce.checkout.total")}</Text>
        {loading ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <Text className="text-text-link font-semibold">{data?.total}</Text>
        )}
      </View>
      <Button
        className="flex-1"
        loading={loading}
        disabled={disabled}
        onPress={() => onPlaceOrder?.(data?.total || 0)}
      >
        {t("commerce.checkout.placeOrder")}
      </Button>
    </BottomActionWrapper>
  );
};
