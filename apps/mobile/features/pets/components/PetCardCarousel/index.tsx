import { SCREEN_WIDTH } from "@/constants/common";
import { PET_KEY } from "@/constants/query-keys";
import { IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { cn } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { memo, useState } from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { Skeleton } from "@/components/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { AddCard } from "./AddCard";
import { DetailCard } from "./DetailCard";
import { CARD_HEIGHT, CARD_WIDTH } from "./utils";

interface IProps {
  onEdit: (value: IPet) => void;
  onDelete: (value: IPet) => void;
}

export const PetCardCarousel = memo<IProps>(({ onDelete, onEdit }) => {
  const {
    data: petData,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const pets = petData?.data ?? [];
  const currentPetCount = pets.length;
  const allCards = [...pets, { id: "add" } as any];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const idx = Math.round(event.contentOffset.x / CARD_WIDTH);
      runOnJS(setActiveIndex)(Math.max(0, Math.min(idx, allCards.length - 1)));
    },
  });

  const isSingleCard = allCards.length === 1;

  // For single card, scrollX stays 0 and index 0 → always centered (scale 1)
  const staticScrollX = useSharedValue(0);

  if (isLoading) {
    return (
      <View className="flex-1 mt-40 items-center">
        <Skeleton
          className="rounded-28"
          backgroundClassName="bg-background-surface-muted"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        />
        <View className="flex-row items-center justify-center gap-6 mt-18 mb-8">
          <View className="h-6 w-18 rounded-5 bg-feature-pet-accent" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mx-20 mt-40 rounded-24 border border-line-subtle bg-background-surface">
        <StateView
          variant="error"
          title="Pets could not load"
          description="Try again to see your pet cards."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 mt-40">
      {/* Cards */}
      {isSingleCard ? (
        <View className="items-center justify-center">
          {allCards[0].id === "add" ? (
            <AddCard
              index={0}
              scrollX={staticScrollX}
              currentPetCount={currentPetCount}
            />
          ) : (
            <DetailCard
              pet={allCards[0]}
              isCenter
              index={0}
              scrollX={staticScrollX}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          )}
        </View>
      ) : (
        <Animated.ScrollView
          horizontal
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center gap-0"
          contentContainerStyle={[
            { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 },
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {allCards.map((item, idx) => (
            <View
              key={item.id}
              style={{
                width: CARD_WIDTH,
              }}
            >
              {item.id === "add" ? (
                <AddCard
                  index={idx}
                  scrollX={scrollX}
                  currentPetCount={currentPetCount}
                />
              ) : (
                <DetailCard
                  pet={item}
                  isCenter={idx === activeIndex}
                  index={idx}
                  scrollX={scrollX}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              )}
            </View>
          ))}
        </Animated.ScrollView>
      )}

      {/* Dots */}
      <View className="flex-row items-center justify-center gap-6 mt-18 mb-8">
        {allCards.map((_, idx) => (
          <View
            key={idx}
            className={cn("size-6 rounded-5 bg-line-subtle", {
              "w-18 bg-feature-pet-accent": idx === activeIndex,
            })}
          />
        ))}
      </View>
    </View>
  );
});

PetCardCarousel.displayName = "PetCardCarousel";
