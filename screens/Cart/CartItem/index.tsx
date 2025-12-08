import { QuantityInput } from "@/components/QuantityInput";
import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Checkbox } from "@/components/ui/Checkbox";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ICartItemResponse } from "@/interfaces";
import { UpdateCartParams } from "@/services";
import { calculateDiscountPercentage } from "@/utils";
import { TrashIcon } from "phosphor-react-native";
import { View } from "react-native";

const DeleteIcon = withIconClassName(TrashIcon);
interface ICartItemProps {
  data: ICartItemResponse;
  onUpdate: (item: UpdateCartParams) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const CartItem = ({
  data,
  onUpdate,
  onDelete,
  isDeleting,
}: ICartItemProps) => {
  const handleChangeSelect = (checked: boolean) => {
    console.log("first");
    onUpdate({
      id: data.id,
      quantity: data.quantity,
      is_select: checked,
    });
  };

  const handleChangeQuantity = (quantity: number) => {
    onUpdate({
      id: data.id,
      quantity,
      is_select: data.is_select,
    });
  };

  return (
    <SwipeableWrapper
      rightAction={{
        onPress: () => onDelete(data.id),
        width: 50,
        icon: <DeleteIcon className="text-icon-foreground" />,
        loading: isDeleting,
        disabled: isDeleting,
      }}
      swipeThreshold={60}
    >
      <View className="flex-row bg-background-card-info px-3 gap-3 py-2 items-center">
        <Checkbox
          disabled={isDeleting}
          defaultValue={data.is_select}
          key={String(data.is_select)}
          onChange={handleChangeSelect}
        />
        <Image
          source={require("@/assets/images/fallback-product.png")}
          className="size-20"
          contentFit="cover"
        />
        <View className="flex-1">
          <Text numberOfLines={1}>{data?.products?.name}</Text>
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="font-bold text-text-link">
                {data?.products?.sale_price}
              </Text>
              <View className="flex-row gap-2">
                <Text
                  variant="body2"
                  className="line-through text-text-secondary"
                >
                  {data?.products?.original_price}
                </Text>
                <View className="p-1 items-center rounded-md justify-center bg-background-primary">
                  <Text
                    variant="caption2"
                    className="font-semibold text-text-primary-inverse"
                  >
                    {calculateDiscountPercentage(
                      data?.products?.original_price,
                      data?.products?.sale_price
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <QuantityInput
              size="sm"
              swarthy
              disabled={isDeleting}
              min={1}
              max={data?.products?.stock_quantity}
              onChange={handleChangeQuantity}
              value={data?.quantity}
              key={data.quantity}
            />
          </View>
        </View>
      </View>
    </SwipeableWrapper>
  );
};
