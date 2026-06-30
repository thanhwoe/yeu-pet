import { Spinner } from "@/components/ui/Spinner";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { EmptyPhotos } from "@/features/photos/components/EmptyPhotos";
import { PhotoGalleryViewer } from "@/features/photos/components/PhotoGalleryViewer";
import { PhotoItem } from "@/features/photos/components/PhotoItem";
import { LIMIT } from "@/features/photos/utils";
import { IPhoto } from "@/interfaces";
import { getListUserPhotosQuery } from "@/services";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export const UserPhotos = () => {
  const { t } = useTranslation();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);
  const {
    data = [],
    isLoading,
    isError,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
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

  const openViewer = useCallback((index: number) => {
    setInitialViewerIndex(index);
    setViewerVisible(true);
  }, []);
  const closeViewer = useCallback(() => setViewerVisible(false), []);

  const renderItem = useCallback<ListRenderItem<IPhoto>>(
    ({ item, index }) => (
      <PhotoItem data={item} index={index} onPress={openViewer} />
    ),
    [openViewer],
  );

  const keyExtractor = useCallback((item: IPhoto) => item.id, []);
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <FlashList
        data={data}
        numColumns={3}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyPhotos
            isLoading={isLoading}
            isError={isError}
            title={t("photos.empty.userTitle")}
            description={t("photos.empty.userDescription")}
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
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={refetch}
        contentContainerStyle={{ paddingBottom: 112 }}
      />

      <PhotoGalleryViewer
        visible={viewerVisible}
        photos={data}
        initialIndex={initialViewerIndex}
        deleteAble
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        fetchNextPage={fetchNextPage}
        onClose={closeViewer}
      />
    </>
  );
};
