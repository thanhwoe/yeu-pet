import { CartButton } from "@/components/CartButton";
import { SearchInput } from "@/components/SearchInput";
import { CART_KEY } from "@/constants/query-keys";
import { getCartCountQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface IProps {
  onSearchChange: (value: string) => void;
}

export const StoreHeader = ({ onSearchChange }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: CART_KEY.count(),
    queryFn: getCartCountQuery,
  });

  const debouncedSearch = debounce(onSearchChange, 500);

  return (
    <View className="flex-row gap-2 px-5 pb-1">
      <SearchInput
        onChange={debouncedSearch}
        placeholder={t("commerce.product.searchPlaceholder")}
        className="flex-1"
      />

      <CartButton
        onPress={() => router.navigate("/cart")}
        badge={data?.data.count}
      />
    </View>
  );
};
