import { Toast } from "@/components/Toast";
import { CART_KEY } from "@/constants/query-keys";
import { updateCartMutation, UpdateCartParams } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export const useUpdateCart = (delay: number = 1000) => {
  const pendingUpdatesRef = useRef<Map<string, UpdateCartParams>>(new Map());
  const debouncedUpdateRef = useRef<ReturnType<typeof debounce> | null>(null);

  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: updateCart, isPending } = useMutation({
    mutationFn: updateCartMutation,
    onError: (e) => {
      Toast.error({
        title: "Cart not updated",
        text:
          e.errors?.[0].message ??
          "Check the quantity and try updating your cart again.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY.lists() });

      pendingUpdatesRef.current.clear();
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const callUpdateAPI = useCallback(() => {
    const updates = Array.from(pendingUpdatesRef.current.values());
    if (updates.length > 0) {
      updateCart(updates);
    }
  }, [updateCart]);

  if (!debouncedUpdateRef.current) {
    debouncedUpdateRef.current = debounce(callUpdateAPI, delay);
  }

  useEffect(() => {
    return () => {
      debouncedUpdateRef.current?.cancel();
    };
  }, []);

  const handleUpdateCart = useCallback(
    (itemOrItems: UpdateCartParams | UpdateCartParams[]) => {
      setIsUpdating(true);
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

      items.forEach((item) => {
        if (item.id) {
          pendingUpdatesRef.current.set(item.id, item);
        }
      });

      debouncedUpdateRef.current?.();
    },
    []
  );

  return {
    handleUpdateCart,
    isPending: isUpdating || isPending,
  };
};
