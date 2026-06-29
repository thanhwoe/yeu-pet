import { Text } from "@/components/ui/Text";
import { IOrderSummaryResponse } from "@/interfaces";
import { cn } from "@/utils";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItem, View } from "react-native";

interface IProps {
  data?: IOrderSummaryResponse["data"]["summary"];
}

export const SummarySection = ({ data }: IProps) => {
  const { t } = useTranslation();
  const dataMapping = useMemo(
    () => [
      {
        label: t("commerce.checkout.subtotal"),
        value: data?.sale_total,
      },
      {
        label: t("commerce.checkout.originalTotal"),
        value: data?.original_total,
        color: "text-text-secondary",
      },
      {
        label: t("commerce.checkout.productDiscount"),
        value: data?.discount_total,
        color: "text-text-negative",
      },
      {
        label: t("commerce.checkout.shippingFee"),
        value: data?.shipping_fee,
      },
    ],
    [
      data?.discount_total,
      data?.original_total,
      data?.sale_total,
      data?.shipping_fee,
      t,
    ]
  );

  const renderItem: ListRenderItem<(typeof dataMapping)[number]> = ({
    item,
  }) => (
    <View className="flex-row justify-between py-1 gap-2">
      <Text variant="body2">{item.label}</Text>
      <Text className={cn(item.color)} variant="body2" numberOfLines={1}>
        {item.value}
      </Text>
    </View>
  );

  return (
    <View className="border border-line-tertiary py-2 px-3 bg-background-card-info rounded-xl">
      <Text className="font-semibold">
        {t("commerce.checkout.orderSummary")}
      </Text>
      <FlatList
        data={dataMapping}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.label}
      />
      <View className="border-t border-line-inverse flex-row justify-between pt-2">
        <Text className="font-semibold" variant="body2">
          {t("commerce.checkout.total")}
        </Text>
        <Text className="font-semibold" variant="body2">
          {data?.total}
        </Text>
      </View>
    </View>
  );
};
