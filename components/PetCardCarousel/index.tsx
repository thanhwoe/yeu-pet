import { PET_KEY } from "@/constants/query-keys";
import { IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { cn } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { memo, useState } from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { AddCard } from "./AddCard";
import { DetailCard } from "./DetailCard";
import { CARD_WIDTH } from "./utils";

interface IProps {
  onEdit: (value: IPet) => void;
  onDelete: (value: IPet) => void;
}

export const PetCardCarousel = memo<IProps>(({ onDelete, onEdit }) => {
  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const allCards = [...(petData?.data ?? []), { id: "add" } as any];

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

  return (
    <View className="flex-1 mt-40">
      {/* Cards */}
      {isSingleCard ? (
        <View className="items-center justify-center">
          {allCards[0].id === "add" ? (
            <AddCard index={0} scrollX={staticScrollX} />
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
                <AddCard index={idx} scrollX={scrollX} />
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
            className={cn("size-6 rounded-5 bg-background-secondary-pressed", {
              "w-18 bg-background-secondary-highlight": idx === activeIndex,
            })}
          />
        ))}
      </View>
    </View>
  );
});

PetCardCarousel.displayName = "PetCardCarousel";
