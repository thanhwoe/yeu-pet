import { Skeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { useSitters } from "@/features/sitter/useSitters";
import { IPetSitter } from "@/interfaces";
import { cn, formatCurrency } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { StarIcon } from "phosphor-react-native";
import { memo, useCallback } from "react";
import { View } from "react-native";

const formatRate = (value: string | number) =>
  formatCurrency(Number(value || 0), "₫", "vi-VN");

const getSitterName = (sitter: IPetSitter) => {
  const name = [sitter.account?.firstName, sitter.account?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Pet sitter";
};

const SITTER_SKELETON_ITEMS = [0, 1, 2, 3];

const SitterSkeleton = () => (
  <View className="gap-16 mt-20">
    {SITTER_SKELETON_ITEMS.map((index) => (
      <Skeleton
        key={index}
        className="h-112 rounded-20"
        backgroundClassName="bg-background-primary"
      />
    ))}
  </View>
);

const SitterCard = memo(({ sitter }: { sitter: IPetSitter }) => {
  const rating = Number(sitter.avgRating || 0).toFixed(1);

  return (
    <View className="bg-background-card rounded-20 px-16 py-16 gap-14">
      <View className="flex-row items-center gap-12">
        <Avatar
          size="large"
          source={{
            uri: sitter.account?.avatarUrl ?? undefined,
          }}
        />
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-12">
            <Heading variant="h6" weight="bold" numberOfLines={1}>
              {getSitterName(sitter)}
            </Heading>
            <View className="flex-row items-center gap-4">
              <StarIcon size={16} weight="fill" color="#F0C400" />
              <Body variant="body3" weight="semiBold">
                {rating}
              </Body>
            </View>
          </View>
          <Body
            variant="body3"
            numberOfLines={1}
            className="text-text-tertiary-inverse"
          >
            {sitter.address}
          </Body>
        </View>
      </View>

      <View className="flex-row gap-12">
        <View className="flex-1 rounded-14 bg-background-card-highlight px-12 py-10">
          <Body variant="body5" caps className="text-text-tertiary-inverse">
            Hourly
          </Body>
          <Body variant="body3" weight="bold">
            {formatRate(sitter.hourlyRate)}
          </Body>
        </View>
        <View className="flex-1 rounded-14 bg-background-card-highlight px-12 py-10">
          <Body variant="body5" caps className="text-text-tertiary-inverse">
            Daily
          </Body>
          <Body variant="body3" weight="bold">
            {formatRate(sitter.dailyRate)}
          </Body>
        </View>
      </View>

      <Body
        variant="body3"
        numberOfLines={2}
        className={cn("text-text-tertiary-inverse", {
          "italic opacity-70": !sitter.bio,
        })}
      >
        {sitter.bio || "No sitter bio yet."}
      </Body>
    </View>
  );
});

SitterCard.displayName = "SitterCard";

export const SitterScreen = () => {
  const { sitters, isLoading, isError, refetch } = useSitters();
  const renderSitter = useCallback<ListRenderItem<IPetSitter>>(
    ({ item }) => <SitterCard sitter={item} />,
    [],
  );

  return (
    <ScreenContainer>
      <View className="pt-safe-offset-20 pb-16 gap-4">
        <Heading variant="h4" weight="bold">
          Sitter
        </Heading>
        <Body variant="body3" className="text-text-tertiary-inverse">
          Find trusted care for your pet.
        </Body>
      </View>

      <FlashList
        data={sitters}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-16 pb-safe"
        estimatedItemSize={176}
        showsVerticalScrollIndicator={false}
        renderItem={renderSitter}
        ListEmptyComponent={() => {
          if (isLoading) {
            return <SitterSkeleton />;
          }

          if (isError) {
            return (
              <StateView
                variant="error"
                title="Could not load sitters"
                description="Check your connection and try again."
                actionLabel="Try again"
                onAction={() => refetch()}
              />
            );
          }

          return (
            <StateView
              variant="empty"
              title="No sitters available"
              description="Available pet sitters will appear here."
            />
          );
        }}
      />
    </ScreenContainer>
  );
};
