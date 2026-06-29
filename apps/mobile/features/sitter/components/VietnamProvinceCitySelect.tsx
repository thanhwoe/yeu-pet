import { InputField } from "@/components/ui/InputField";
import { Body, Heading } from "@/components/ui/Typography";
import {
  resolveVietnamProvinceCityName,
  VIETNAM_PROVINCE_CITY_CODES,
  VietnamProvinceCityName,
} from "@/constants/vietnam-location-options";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { CaretDownIcon, CheckIcon, XIcon } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CaretDown = withIconClassName(CaretDownIcon);
const Check = withIconClassName(CheckIcon);
const X = withIconClassName(XIcon);

type ProvinceCityOption = (typeof VIETNAM_PROVINCE_CITY_CODES)[number];

interface VietnamProvinceCitySelectProps {
  value?: string;
  onChange: (value?: VietnamProvinceCityName) => void;
  label?: string;
  emptyLabel?: string;
  clearLabel?: string;
  errorMessage?: string;
}

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi")
    .replace(/đ/g, "d");

export const VietnamProvinceCitySelect = ({
  value,
  onChange,
  label,
  emptyLabel,
  clearLabel,
  errorMessage,
}: VietnamProvinceCitySelectProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const resolvedValue = resolveVietnamProvinceCityName(value);
  const effectiveLabel = label ?? t("sitter.form.city");
  const effectiveEmptyLabel = emptyLabel ?? t("sitter.form.cityEmpty");
  const effectiveClearLabel = clearLabel ?? t("sitter.form.cityClear");
  const displayValue = resolvedValue ?? value?.trim() ?? effectiveEmptyLabel;
  const normalizedSearch = normalizeSearchValue(search.trim());
  const options = useMemo(
    () =>
      normalizedSearch
        ? VIETNAM_PROVINCE_CITY_CODES.filter((item) =>
            normalizeSearchValue(item.name).includes(normalizedSearch),
          )
        : [...VIETNAM_PROVINCE_CITY_CODES],
    [normalizedSearch],
  );

  const close = useCallback(() => {
    setSearch("");
    setVisible(false);
  }, []);

  const select = useCallback(
    (nextValue?: VietnamProvinceCityName) => {
      onChange(nextValue);
      close();
    },
    [close, onChange],
  );

  const renderOption = useCallback<ListRenderItem<ProvinceCityOption>>(
    ({ item }) => {
      const selected = resolvedValue === item.name;

      return (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          onPress={() => select(item.name)}
          className={cn(
            "min-h-52 flex-row items-center justify-between gap-12 rounded-16 border border-line-subtle bg-background-surface px-16 py-12",
            selected && "border-action-primary bg-action-secondary",
          )}
        >
          <Body
            variant="body3"
            weight="semiBold"
            className={cn(
              "flex-1",
              selected && "text-action-secondary-foreground",
            )}
          >
            {item.name}
          </Body>
          {selected ? (
            <Check size={18} weight="bold" className="text-icon-primary" />
          ) : null}
        </Pressable>
      );
    },
    [resolvedValue, select],
  );

  return (
    <View className="gap-8">
      {effectiveLabel ? (
        <Body variant="body3" weight="semiBold">
          {effectiveLabel}
        </Body>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${effectiveLabel}: ${displayValue}`}
        accessibilityState={{ expanded: visible }}
        onPress={() => setVisible(true)}
        className={cn(
          "min-h-44 flex-row items-center justify-between gap-12 rounded-8 border border-line-secondary-inverse bg-background-foreground px-16 py-10",
          errorMessage && "border-line-negative",
        )}
      >
        <Body
          variant="body3"
          className={cn("flex-1", !value && "text-text-tertiary")}
        >
          {displayValue}
        </Body>
        <CaretDown size={18} className="text-icon-secondary" />
      </Pressable>
      {errorMessage ? (
        <Body variant="body4" className="text-text-negative">
          {errorMessage}
        </Body>
      ) : null}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={close}
      >
        <View
          accessibilityViewIsModal
          className="flex-1 bg-background"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between border-b border-line-subtle px-20 py-12">
            <Heading variant="h5" weight="bold">
              {t("sitter.selectCity.title")}
            </Heading>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("sitter.accessibility.closeCitySelection")}
              onPress={close}
              className="h-44 w-44 items-center justify-center rounded-full bg-background-surface-muted"
            >
              <X size={20} className="text-icon-primary" />
            </Pressable>
          </View>

          <View className="px-20 py-16">
            <InputField
              accessibilityLabel={t("sitter.accessibility.searchCity")}
              placeholder={t("sitter.selectCity.searchPlaceholder")}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>

          <FlashList
            data={options}
            keyExtractor={(item) => item.code}
            renderItem={renderOption}
            estimatedItemSize={54}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-safe"
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            ItemSeparatorComponent={() => <View className="h-8" />}
            ListHeaderComponent={
              search ? null : (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: !value }}
                  onPress={() => select(undefined)}
                  className={cn(
                    "min-h-52 mb-8 flex-row items-center justify-between gap-12 rounded-16 border border-line-subtle bg-background-surface px-16 py-12",
                    !value && "border-action-primary bg-action-secondary",
                  )}
                >
                  <Body
                    variant="body3"
                    weight="semiBold"
                    className={cn(
                      "flex-1",
                      !value && "text-action-secondary-foreground",
                    )}
                  >
                    {effectiveClearLabel}
                  </Body>
                  {!value ? (
                    <Check
                      size={18}
                      weight="bold"
                      className="text-icon-primary"
                    />
                  ) : null}
                </Pressable>
              )
            }
            ListEmptyComponent={
              <Body variant="body3" center className="py-24 text-text-muted">
                {t("sitter.selectCity.emptySearch")}
              </Body>
            }
          />
        </View>
      </Modal>
    </View>
  );
};
