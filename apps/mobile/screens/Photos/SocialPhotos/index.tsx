import { PHOTOS_KEY } from "@/constants/query-keys";
import { getListSocialPhotosQuery } from "@/services";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EmptyPhotos } from "../EmptyPhotos";
import { PhotoItem } from "../PhotoItem";
import { ITEM_WIDTH, LIMIT } from "../util";

export const SocialPhotos = () => {
  const {
    data = [],
    hasNextPage,
    isLoading,
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
      if (!lastPage.metadata.nextPage) return null;

      return lastPage.metadata.nextPage;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  return (
    <FlashList
      data={data}
      extraData={data}
      numColumns={3}
      renderItem={({ item, index }) => <PhotoItem data={item} index={index} />}
      ListEmptyComponent={<EmptyPhotos isLoading={isLoading} />}
      estimatedItemSize={ITEM_WIDTH}
      showsVerticalScrollIndicator={false}
      onEndReached={hasNextPage ? fetchNextPage : undefined}
    />
  );
};
