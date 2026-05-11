import { PHOTOS_KEY } from "@/constants/query-keys";
import { getListUserPhotosQuery } from "@/services";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EmptyPhotos } from "../EmptyPhotos";
import { PhotoItem } from "../PhotoItem";
import { ITEM_WIDTH, LIMIT } from "../util";

export const UserPhotos = () => {
  const {
    data = [],
    isLoading,
    hasNextPage,
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
      if (!lastPage.metadata.nextPage) return null;

      return lastPage.metadata.nextPage;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  return (
    <FlashList
      data={data}
      numColumns={3}
      renderItem={({ item, index }) => (
        <PhotoItem data={item} index={index} deleteAble />
      )}
      estimatedItemSize={ITEM_WIDTH}
      ListEmptyComponent={<EmptyPhotos isLoading={isLoading} />}
      showsVerticalScrollIndicator={false}
      onEndReached={hasNextPage ? fetchNextPage : undefined}
    />
  );
};
