import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import {
  SitterActiveFilters,
  SitterCard,
  SitterSkeleton,
} from "@/features/sitter/components";
import { hasSitterFilters } from "@/features/sitter/filters";
import { useSitterExplore } from "@/features/sitter/hooks/useSitterExplore";
import { useSitterFilters } from "@/features/sitter/SitterFiltersContext";
import { withIconClassName } from "@/hocs/withIconClassName";
import { type IPetSitter } from "@/interfaces";
import { cn } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";
import {
  CalendarCheckIcon,
  SlidersHorizontalIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

const CalendarCheck = withIconClassName(CalendarCheckIcon);
const SlidersHorizontal = withIconClassName(SlidersHorizontalIcon);
const UserCircle = withIconClassName(UserCircleIcon);

export const SitterExploreScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { appliedFilters, filterRevision, beginEditing, clearAppliedFilters } =
    useSitterFilters();
  const { sitters, isLoading, isError, isRefreshing, refetch } =
    useSitterExplore(appliedFilters, filterRevision);
  const hasActiveFilters = hasSitterFilters(appliedFilters);

  const openFilters = () => {
    beginEditing();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const openSitterDetail = useCallback(
    (sitter: IPetSitter) => {
      router.push({
        pathname: "/sitter/[sitterId]",
        params: { sitterId: sitter.id },
      });
    },
    [router],
  );

  const renderSitter = useCallback<ListRenderItem<IPetSitter>>(
    ({ item }) => <SitterCard sitter={item} onPress={openSitterDetail} />,
    [openSitterDetail],
  );

  return (
    <ScreenContainer>
      <View className="pt-safe-offset-20 pb-16 gap-14">
        <View className="flex-row items-start justify-between gap-12">
          <View className="min-w-0 flex-1 gap-4">
            <Heading variant="h4" weight="bold">
              {t("sitter.screen.title")}
            </Heading>
            <Body variant="body3" className="text-text-muted">
              {t("sitter.screen.subtitle")}
            </Body>
          </View>

          <View className="flex-row gap-8">
            <HeaderIconButton
              accessibilityLabel={t("sitter.accessibility.openBookings")}
              onPress={() => router.push("/sitter/bookings")}
            >
              <CalendarCheck size={20} className="text-icon-primary" />
            </HeaderIconButton>
            <HeaderIconButton
              accessibilityLabel={t("sitter.accessibility.openProfileManager")}
              onPress={() => router.push("/sitter/profile")}
            >
              <UserCircle size={20} className="text-icon-primary" />
            </HeaderIconButton>
            <HeaderIconButton
              accessibilityLabel={t("sitter.accessibility.filterSitters")}
              accessibilityState={{ selected: hasActiveFilters }}
              selected={hasActiveFilters}
              onPress={openFilters}
            >
              <SlidersHorizontal
                size={20}
                className={
                  hasActiveFilters
                    ? "text-action-primary-foreground"
                    : "text-icon-primary"
                }
              />
            </HeaderIconButton>
          </View>
        </View>

        <SitterActiveFilters />
      </View>

      <FlashList
        data={sitters}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-16 pb-safe"
        showsVerticalScrollIndicator={false}
        renderItem={renderSitter}
        refreshing={isRefreshing}
        onRefresh={refetch}
        ListEmptyComponent={() => {
          if (isLoading) {
            return <SitterSkeleton />;
          }

          if (isError) {
            return (
              <StateView
                variant="error"
                title={t("sitter.screen.loadErrorTitle")}
                description={t("sitter.screen.loadErrorDescription")}
                actionLabel={t("common.tryAgain")}
                onAction={() => refetch()}
              />
            );
          }

          return (
            <StateView
              variant="empty"
              title={t("sitter.screen.emptySittersTitle")}
              description={
                hasActiveFilters
                  ? t("sitter.screen.emptyFilteredDescription")
                  : t("sitter.screen.emptySittersDescription")
              }
              actionLabel={
                hasActiveFilters ? t("sitter.filters.reset") : undefined
              }
              onAction={hasActiveFilters ? clearAppliedFilters : undefined}
            />
          );
        }}
      />
    </ScreenContainer>
  );
};

const HeaderIconButton = ({
  accessibilityLabel,
  accessibilityState,
  children,
  onPress,
  selected,
}: {
  accessibilityLabel: string;
  accessibilityState?: { selected?: boolean };
  children: ReactNode;
  onPress: () => void;
  selected?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={accessibilityState}
    onPress={onPress}
    className={cn(
      "h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface",
      selected && "border-action-primary bg-action-primary",
    )}
  >
    {children}
  </Pressable>
);
