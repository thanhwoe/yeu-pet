import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { ORDER_KEY, SHIPPING_ADDRESS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IShippingAddress } from "@/interfaces";
import {
  createShippingAddressMutation,
  deleteShippingAddressMutation,
  getShippingAddressesQuery,
} from "@/services/shipping-address";
import { useShopStore } from "@/stores/shop-store";
import { cn } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import parsePhoneNumber from "libphonenumber-js";
import { orderBy } from "lodash";
import { TrashIcon } from "phosphor-react-native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, ListRenderItem, Pressable, View } from "react-native";
import { AddressForm } from "./AddressForm";

const DeleteIcon = withIconClassName(TrashIcon);

type MutationError = {
  errors?: {
    message: string;
  }[];
};

interface ShippingAddressItemProps {
  item: IShippingAddress;
  selected: boolean;
  onSelect: (address: IShippingAddress) => void;
  onDelete: (id: string) => void;
}

const ShippingAddressItem = memo(
  ({ item, selected, onSelect, onDelete }: ShippingAddressItemProps) => {
    const { t } = useTranslation();
    const phoneNumber = useMemo(
      () => parsePhoneNumber(item.phone)?.formatNational(),
      [item.phone],
    );

    const handleSelect = useCallback(() => {
      onSelect(item);
    }, [item, onSelect]);

    const handleDelete = useCallback(() => {
      onDelete(item.id);
    }, [item.id, onDelete]);

    return (
      <Pressable
        className={cn(
          "py-2 px-3 rounded-xl border-line-secondary flex-row gap-3 border bg-background-card-info",
          { "border-line-selected": selected },
        )}
        onPress={handleSelect}
      >
        <Checkbox pointerEvents="none" size="small" checked={selected} />
        <View className="flex-1">
          <Text className="font-bold" variant="body2" numberOfLines={1}>
            {item.full_name}
          </Text>
          <Text variant="body2">{phoneNumber}</Text>
          <Text
            variant="body2"
            className="text-text-secondary"
            numberOfLines={2}
          >
            {item.address}
          </Text>
        </View>
        {item.is_default ? (
          <View className="bg-background-secondary self-start px-2 rounded-xl">
            <Text variant="footnote" className="text-text-primary-inverse">
              {t("commerce.address.default")}
            </Text>
          </View>
        ) : (
          <Pressable onPress={handleDelete}>
            <DeleteIcon
              size={18}
              weight="bold"
              className="text-icon-secondary"
            />
          </Pressable>
        )}
      </Pressable>
    );
  },
);

ShippingAddressItem.displayName = "ShippingAddressItem";

export const ShippingAddressScreen = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { action } = useLocalSearchParams();
  const { setShippingAddress, shippingAddress, clearShippingAddress } =
    useShopStore((state) => state);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);

  useEffect(() => {
    if (action === "add") {
      setOpenBottomSheet(true);
    }
  }, [action]);

  const { data: shippingAddresses, isLoading } = useQuery({
    queryKey: SHIPPING_ADDRESS_KEY.list(),
    queryFn: getShippingAddressesQuery,
  });

  const { mutateAsync: createShippingAddress, isPending: creating } =
    useMutation({
      mutationFn: createShippingAddressMutation,
      onError: (e: MutationError) => {
        Toast.error({
          title: t("commerce.address.notAddedTitle"),
          text:
            e.errors?.[0]?.message ??
            t("commerce.address.notAddedFallback"),
        });
      },
      onSuccess: () => {
        setOpenBottomSheet(false);
        queryClient.invalidateQueries({
          queryKey: SHIPPING_ADDRESS_KEY.list(),
        });
        queryClient.invalidateQueries({
          queryKey: ORDER_KEY.lists(),
        });
      },
    });

  const { mutateAsync: deleteShippingAddress, isPending: deleting } =
    useMutation({
      mutationFn: deleteShippingAddressMutation,
      onError: (e: MutationError) => {
        Toast.error({
          title: t("commerce.address.notRemovedTitle"),
          text: e.errors?.[0]?.message ?? t("commerce.address.notRemovedFallback"),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: SHIPPING_ADDRESS_KEY.list(),
        });
        queryClient.invalidateQueries({
          queryKey: ORDER_KEY.lists(),
        });
      },
    });

  const closeBottomSheet = useCallback(() => setOpenBottomSheet(false), []);
  const openBottomSheetForm = useCallback(() => setOpenBottomSheet(true), []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      t("commerce.address.deleteTitle"),
      t("commerce.address.deleteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("commerce.address.deleteConfirm"),
          onPress: () => {
            deleteShippingAddress(id);
            if (shippingAddress?.id === id) {
              clearShippingAddress();
            }
          },
          style: "destructive",
        },
      ]
    );
  }, [clearShippingAddress, deleteShippingAddress, shippingAddress?.id, t]);

  const renderItem = useCallback<ListRenderItem<IShippingAddress>>(
    ({ item }) => {
      const selected = shippingAddress?.id
        ? shippingAddress.id === item.id
        : item.is_default;

      return (
        <ShippingAddressItem
          item={item}
          selected={selected}
          onSelect={setShippingAddress}
          onDelete={handleDelete}
        />
      );
    },
    [handleDelete, setShippingAddress, shippingAddress?.id],
  );

  const keyExtractor = useCallback((item: IShippingAddress) => item.id, []);

  const listEmptyComponent = useMemo(() => {
    if (isLoading) {
      return <Skeleton className="h-10" />;
    }
    return (
      <View className="p-10 gap-2">
        <Text className="text-center font-medium">
          {t("commerce.address.emptyTitle")}
        </Text>
        <Text className="text-center">
          {t("commerce.address.emptyDescription")}
        </Text>
      </View>
    );
  }, [isLoading, t]);

  const sortedShippingAddresses = useMemo(() => {
    return orderBy(
      shippingAddresses?.data || [],
      [(acc) => acc.is_default],
      ["desc"]
    );
  }, [shippingAddresses]);

  return (
    <ScreenContainer className="!pt-2">
      <FlatList
        data={sortedShippingAddresses}
        contentContainerClassName="gap-2"
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmptyComponent}
      />
      <View className="-mx-5 px-5 pt-3 pb-safe-or-4 bg-background-screen">
        <Button onPress={openBottomSheetForm} loading={deleting}>
          {t("commerce.address.add")}
        </Button>
      </View>
      <BottomSheet
        keyboardBehavior="interactive"
        visible={openBottomSheet}
        onDismiss={closeBottomSheet}
        titleElement={
          <Text className="font-medium">{t("commerce.address.add")}</Text>
        }
      >
        <AddressForm onSubmit={createShippingAddress} loading={creating} />
      </BottomSheet>
    </ScreenContainer>
  );
};
