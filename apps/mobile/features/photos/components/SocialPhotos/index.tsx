import { Spinner } from "@/components/ui/Spinner";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { EmptyPhotos } from "@/features/photos/components/EmptyPhotos";
import { PhotoItem } from "@/features/photos/components/PhotoItem";
import { ITEM_WIDTH, LIMIT } from "@/features/photos/utils";
import { IPhoto } from "@/interfaces";
import { getListSocialPhotosQuery } from "@/services";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { View } from "react-native";

export const SocialPhotos = () => {
  const {
    data = [],
    hasNextPage,
    isLoading,
    isError,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
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
      ListEmptyComponent={
        <EmptyPhotos
          isLoading={isLoading}
          isError={isError}
          title="No shared photos yet"
          description="When the community shares public pet moments, they will appear here."
          onRetry={() => refetch()}
        />
      }
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
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={refetch}
      contentContainerStyle={{ paddingBottom: 112 }}
    />
  );
};
