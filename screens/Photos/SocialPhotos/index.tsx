import { Image } from "@/components/ui/Image";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { getListSocialPhotosQuery } from "@/services";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";

const GAP = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - 40) / 3 - GAP * 2;

export const SocialPhotos = () => {
  const {
    data = [],
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: PHOTOS_KEY.list({ limit: 20 }),
    queryFn: ({ pageParam }) =>
      getListSocialPhotosQuery({
        limit: 10,
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
      renderItem={({ item, index }) => (
        <Image
          style={{
            height: ITEM_WIDTH,
            width: ITEM_WIDTH,
            marginBottom: GAP,
            marginLeft: index % 3 === 0 ? GAP : GAP / 2,
            marginRight: index % 3 === 2 ? GAP : GAP / 2,
            borderRadius: 10,
          }}
          source={{ uri: item.url }}
        />
      )}
      estimatedItemSize={ITEM_WIDTH}
      showsVerticalScrollIndicator={false}
      onEndReached={hasNextPage ? fetchNextPage : undefined}
    />
  );
};
