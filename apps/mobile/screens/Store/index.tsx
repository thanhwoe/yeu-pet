import { ListLoader } from "@/components/ListLoader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { PRODUCTS_KEY } from "@/constants/query-keys";
import { getListProductsQuery } from "@/services";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlatList } from "react-native";
import { CATEGORIES, Category } from "./Category";
import { ProductCard } from "./ProductCard";
import { StoreHeader } from "./StoreHeader";
import { StoreSkeleton } from "./StoreSkeleton";

const LIMIT = 6;

export const StoreScreen = () => {
  const [searchKey, setSearchKey] = useState("");
  const [category, setCategory] = useState("");

  const {
    data = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: PRODUCTS_KEY.list({ limit: LIMIT, searchKey, category }),
    queryFn: ({ pageParam }) =>
      getListProductsQuery({
        limit: LIMIT,
        page: pageParam,
        query: searchKey,
        category,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.metadata.nextPage) return null;

      return lastPage.metadata.nextPage;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  const handleToggleCategory = (category: string) => {
    setCategory((pre) => (pre === category ? "" : category));
  };

  return (
    <ScreenContainer className="!px-0">
      <StoreHeader onSearchChange={setSearchKey} />

      <FlashList
        data={data}
        ListEmptyComponent={() => {
          if (isLoading) return <StoreSkeleton />;
          return (
            <Text className="text-center text-gray-500 mt-5">
              No item found
            </Text>
          );
        }}
        ListHeaderComponent={() => (
          <FlatList
            data={CATEGORIES}
            className="my-3"
            contentContainerClassName="gap-2 px-5"
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Category
                data={item}
                selected={item.value === category}
                onPress={() => handleToggleCategory(item.value)}
              />
            )}
          />
        )}
        ListFooterComponent={() => (isFetchingNextPage ? <ListLoader /> : null)}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        estimatedItemSize={236}
        onEndReachedThreshold={0}
        renderItem={({ item, index }) => (
          <ProductCard data={item} index={index} />
        )}
        onEndReached={() => {
          if (isLoading && data.length === 0) return;
          hasNextPage && fetchNextPage();
        }}
      />
    </ScreenContainer>
  );
};
