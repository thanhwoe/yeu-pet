import { SearchInput } from "@/components/SearchInput";
import { SpaCard } from "@/components/SpaCard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { LIST_CITY } from "@/constants/cities";
import { CLINIC_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useDebounce } from "@/hooks/useDebounce";
import { getListSpaQuery } from "@/services/spa";
import { cn } from "@/utils";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CaretDownIcon } from "phosphor-react-native";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

const CaretDown = withIconClassName(CaretDownIcon);

export function ListSpaScreen() {
  const [searchKey, setSearchKey] = useState("");
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const debounceSearch = useDebounce(searchKey, 400);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: CLINIC_KEY.list({ limit: 10, debounceSearch, selectedCity }),
    queryFn: ({ pageParam }) =>
      getListSpaQuery({
        limit: 10,
        page: pageParam,
        query: debounceSearch,
        city: selectedCity,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.metadata.nextPage) return null;

      return lastPage.metadata.nextPage;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  return (
    <ScreenContainer className="!pt-0">
      <SearchInput
        onChange={setSearchKey}
        placeholder="Enter spa name"
        className="mb-4"
      />
      <TouchableOpacity
        className={cn(
          "border rounded-3xl self-start flex-row px-2 gap-1 items-center mb-4 border-line-secondary",

          {
            "border-line-selected": !!selectedCity,
          }
        )}
        onPress={() => setShowCityFilter(true)}
      >
        <Text
          className={cn("", {
            "text-text-secondary": !selectedCity,
          })}
        >
          {selectedCity
            ? LIST_CITY.find((item) => item.value === selectedCity)?.label
            : "City"}
        </Text>
        <CaretDown size={20} />
      </TouchableOpacity>
      <FlashList
        data={data}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500 mt-5">
            No clinics found
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={186}
        renderItem={({ item }) => <SpaCard data={item} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
      />
      <BottomSheet
        visible={showCityFilter}
        titleElement={<Text className="font-medium">Select City</Text>}
        onDismiss={() => setShowCityFilter(false)}
      >
        {LIST_CITY.map((item) => (
          <TouchableOpacity
            className={cn("px-6 py-3", {
              "bg-option-selected": item.value === selectedCity,
            })}
            key={item.value}
            onPress={() => {
              if (item.value === selectedCity) {
                setSelectedCity("");
              } else {
                setSelectedCity(item.value);
              }
              setShowCityFilter(false);
            }}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </ScreenContainer>
  );
}
