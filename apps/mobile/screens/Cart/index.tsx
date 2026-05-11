import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { CART_KEY } from "@/constants/query-keys";
import { ICartItemResponse } from "@/interfaces";
import {
  deleteCartItemMutation,
  getCartQuery,
  UpdateCartParams,
} from "@/services";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { BottomActions } from "./BottomActions";
import { CartItem } from "./CartItem";
import { useUpdateCart } from "./hook/useUpdateCart";

export const CartScreen = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching } = useQuery({
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

  const { mutate: deleteCartItem, isPending: isDeleting } = useMutation({
    mutationFn: deleteCartItemMutation,
    onError: (e) => {
      Toast.error({ text: e.errors?.[0].message });
    },
    onSuccess: (_, variable) => {
      setCartItems((prev) => prev.filter((item) => item.id !== variable));
      queryClient.invalidateQueries({ queryKey: CART_KEY.all });
    },
  });

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

  const hasSelectedItems = cartItems.some((item) => item.is_select);

  const handleUpdateCartItem = (item: UpdateCartParams) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, ...item } : i))
    );

    handleUpdateCart(item);
  };

  if (!data && isLoading) {
    return (
      <ScreenContainer className="!px-0 !pt-0 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-28 w-full" key={index} />
        ))}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="!px-0 !pt-0">
      <FlashList
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        data={cartItems}
        extraData={isRefetching}
        ItemSeparatorComponent={() => <View className="h-2 flex-1" />}
        renderItem={({ item }) => (
          <CartItem
            data={item}
            onUpdate={handleUpdateCartItem}
            onDelete={deleteCartItem}
            isDeleting={isDeleting}
          />
        )}
        estimatedItemSize={100}
        ListEmptyComponent={() => (
          <View>
            <Image
              contentFit="contain"
              className="h-56"
              source={require("@/assets/images/empty-cart.png")}
            />
            <View className="items-center px-10 gap-4">
              <Text variant="title1" className="font-semibold">
                Your cart is empty!
              </Text>
              <Text className="text-center">
                Time to find some new favorites for your furry friend!
              </Text>
              <Button onPress={router.back}>Start Shopping</Button>
            </View>
          </View>
        )}
      />

      {!isEmpty(cartItems) && (
        <BottomActions
          cartSummary={data?.summary}
          loading={isPending}
          hasSelectedItems={hasSelectedItems}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}
    </ScreenContainer>
  );
};
