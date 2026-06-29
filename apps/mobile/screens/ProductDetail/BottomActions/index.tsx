import { BottomActionWrapper } from "@/components/BottomActionWrapper";
import { QuantityInput } from "@/components/QuantityInput";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { CART_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { addToCartMutation } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PlusIcon, ShoppingCartSimpleIcon } from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";

const Plus = withIconClassName(PlusIcon);
const Cart = withIconClassName(ShoppingCartSimpleIcon);

interface IProps {
  loading?: boolean;
}

export const BottomActions = ({ loading }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { mutate: addToCart, isPending: isAdding } = useMutation({
    mutationFn: addToCartMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY.all });

      Toast.success({
        title: t("commerce.product.addedToCartTitle"),
        text: t("commerce.product.addedToCartText"),
      });
    },
    onError: (e) => {
      Toast.error({
        text:
          e.errors?.[0].message ??
          t("commerce.product.itemNotAddedFallback"),
        title: t("commerce.product.itemNotAddedTitle"),
      });
    },
  });

  const handleAddToCart = () => {
    Keyboard.dismiss();
    if (!productId) return;

    addToCart({ quantity, productId: String(productId) });
  };

  if (loading) return null;

  return (
    <BottomActionWrapper
      className="flex-row"
      pointerEvents={isAdding ? "none" : "auto"}
    >
      <QuantityInput
        onChange={setQuantity}
        value={quantity}
        className="rounded-full"
      />
      <Button
        variant="secondary"
        className="bg-option-selected"
        onPress={handleAddToCart}
        disabled={quantity <= 0}
      >
        <View>
          <Cart className="text-icon-highlight" />
          <View className="absolute left-[8px] top-[5px]">
            <Plus size={12} weight="bold" className="text-icon-highlight" />
          </View>
        </View>
      </Button>
      <Button
        className="flex-1"
        disabled={quantity <= 0}
        onPress={() =>
          router.push({
            pathname: "/checkout",
            params: {
              quantity,
              productId: String(productId),
            },
          })
        }
      >
        {t("commerce.product.buyNow")}
      </Button>
    </BottomActionWrapper>
  );
};
