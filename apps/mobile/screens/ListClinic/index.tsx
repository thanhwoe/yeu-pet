import { ClinicCard } from "@/components/ClinicCard";
import { SearchInput } from "@/components/SearchInput";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { LIST_CITY } from "@/constants/cities";
import { CLINIC_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useDebounce } from "@/hooks/useDebounce";
import { IClinic } from "@/interfaces";
import { getListClinicQuery } from "@/services";
import { cn } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CaretDownIcon } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

const CaretDown = withIconClassName(CaretDownIcon);

export function ListClinicScreen() {
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const debounceSearch = useDebounce(searchKey, 400);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: CLINIC_KEY.list({ limit: 10, debounceSearch, selectedCity }),
    queryFn: ({ pageParam }) =>
      getListClinicQuery({
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

  const clinics = data ?? [];
  const selectedCityLabel = useMemo(
    () =>
      selectedCity
        ? LIST_CITY.find((item) => item.value === selectedCity)?.label
        : undefined,
    [selectedCity],
  );

  const openCityFilter = useCallback(() => setShowCityFilter(true), []);
  const closeCityFilter = useCallback(() => setShowCityFilter(false), []);

  const renderClinic = useCallback<ListRenderItem<IClinic>>(
    ({ item }) => <ClinicCard data={item} />,
    [],
  );

  const keyExtractor = useCallback((item: IClinic) => item.clinic_id, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const listEmptyComponent = useMemo(
    () => (
      <Text className="text-center text-gray-500 mt-5">
        {t("common.places.noClinicFound")}
      </Text>
    ),
    [t],
  );

  return (
    <ScreenContainer className="!pt-0">
      <SearchInput
        onChange={setSearchKey}
        placeholder={t("common.places.enterClinicName")}
        className="mb-4"
      />
      <TouchableOpacity
        className={cn(
          "border rounded-3xl self-start flex-row px-2 gap-1 items-center mb-4 border-line-secondary",
          {
            "border-line-selected": !!selectedCity,
          }
        )}
        onPress={openCityFilter}
      >
        <Text
          className={cn("", {
            "text-text-secondary": !selectedCity,
          })}
        >
          {selectedCityLabel ?? t("common.places.city")}
        </Text>
        <CaretDown size={20} />
      </TouchableOpacity>
      <FlashList
        data={clinics}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmptyComponent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={186}
        renderItem={renderClinic}
        onEndReached={handleEndReached}
      />
      <BottomSheet
        visible={showCityFilter}
        onDismiss={closeCityFilter}
        titleElement={
          <Text className="font-medium">{t("common.places.selectCity")}</Text>
        }
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
