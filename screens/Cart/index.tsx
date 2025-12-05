import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CART_KEY } from "@/constants/query-keys";
import { ICartItemResponse } from "@/interfaces";
import { getCartQuery, UpdateCartParams } from "@/services";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { BottomActions } from "./BottomActions";
import { CartItem } from "./CartItem";
import { useUpdateCart } from "./hook/useUpdateCart";

export const CartScreen = () => {
  const { data, isLoading } = useQuery({
    queryKey: CART_KEY.list(),
    queryFn: getCartQuery,
  });

  const [cartItems, setCartItems] = useState<ICartItemResponse[]>([]);

  useEffect(() => {
    if (data?.items) {
      setCartItems(data.items);
    }
  }, [data?.items]);

  const { isPending, handleUpdateCart } = useUpdateCart();

  const handleToggleSelectAll = (value: boolean) => {
    if (isEmpty(cartItems)) return;

    const updatedItems = cartItems.map((item) => ({
      ...item,
      is_select: value,
    }));
    setCartItems(updatedItems);

    const payload = updatedItems.map((item) => ({
      id: item.id,
      is_select: value,
      quantity: item.quantity,
    }));

    handleUpdateCart(payload);
  };

  const handleUpdateCartItem = (item: UpdateCartParams) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, ...item } : i))
    );

    handleUpdateCart(item);
  };

  // TODO: implement loading state
  if (!data) {
    return null;
  }

  return (
    <ScreenContainer className="!px-0 !pt-0">
      <FlashList
        keyExtractor={(item) => item.id}
        data={cartItems}
        ItemSeparatorComponent={() => <View className="h-2 flex-1" />}
        renderItem={({ item }) => (
          <CartItem data={item} onUpdate={handleUpdateCartItem} />
        )}
        estimatedItemSize={100}
      />
      <BottomActions
        cartSummary={data.summary}
        loading={isPending}
        onToggleSelectAll={handleToggleSelectAll}
      />
    </ScreenContainer>
  );
};
