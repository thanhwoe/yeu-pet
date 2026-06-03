import { Spinner } from "@/components/ui/Spinner";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { IPhoto } from "@/interfaces";
import { getListSocialPhotosQuery } from "@/services";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { View } from "react-native";
import { EmptyPhotos } from "../EmptyPhotos";
import { PhotoItem } from "../PhotoItem";
import { ITEM_WIDTH, LIMIT } from "../util";

export const SocialPhotos = () => {
  const {
    data = [],
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: PHOTOS_KEY.list({ limit: LIMIT, key: "social" }),
    queryFn: ({ pageParam }) =>
      getListSocialPhotosQuery({
        limit: LIMIT,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;

      return lastPage.meta.page + 1;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  const renderItem = useCallback<ListRenderItem<IPhoto>>(
    ({ item, index }) => <PhotoItem data={item} index={index} />,
    [],
  );

  const keyExtractor = useCallback((item: IPhoto) => item.id, []);
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <FlashList
      data={data}
      numColumns={3}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={<EmptyPhotos isLoading={isLoading} />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-20">
            <Spinner size={22} />
          </View>
        ) : null
      }
      estimatedItemSize={ITEM_WIDTH}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      contentContainerStyle={{ paddingBottom: 112 }}
    />
  );
};
