import { PHOTOS_KEY } from "@/constants/query-keys";
import { IPhoto } from "@/interfaces";
import { getListUserPhotosQuery } from "@/services";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { EmptyPhotos } from "../EmptyPhotos";
import { PhotoItem } from "../PhotoItem";
import { ITEM_WIDTH, LIMIT } from "../util";

export const UserPhotos = () => {
  const {
    data = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: PHOTOS_KEY.list({ limit: LIMIT, key: "user" }),
    queryFn: ({ pageParam }) =>
      getListUserPhotosQuery({
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
    ({ item, index }) => (
      <PhotoItem data={item} index={index} deleteAble />
    ),
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
      estimatedItemSize={ITEM_WIDTH}
      ListEmptyComponent={<EmptyPhotos isLoading={isLoading} />}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
    />
  );
};
