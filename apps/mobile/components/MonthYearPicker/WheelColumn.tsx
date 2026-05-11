import { useCallback, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
  ViewToken,
} from "react-native";
import { Body } from "../ui/Typography";
import { ITEM_HEIGHT } from "./utils";

interface WheelColumnProps {
  data: (string | number)[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
  width: number;
}

const VISIBLE_ITEMS = 5; // must be odd
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function WheelColumn({
  data,
  initialIndex,
  onIndexChange,
  width,
}: WheelColumnProps) {
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(initialIndex);

  // Pad data so first/last items can centre
  const PADDING = Math.floor(VISIBLE_ITEMS / 2);
  const paddedData = [
    ...Array(PADDING).fill(null),
    ...data,
    ...Array(PADDING).fill(null),
  ];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0].index ?? 0;
        const centreIndex = firstVisible + PADDING;
        const realIndex = centreIndex - PADDING;
        if (
          realIndex >= 0 &&
          realIndex < data.length &&
          realIndex !== currentIndex.current
        ) {
          currentIndex.current = realIndex;
          onIndexChange(realIndex);
        }
      }
    },
    [PADDING, data.length, onIndexChange],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    if (clampedIndex !== currentIndex.current) {
      currentIndex.current = clampedIndex;
      onIndexChange(clampedIndex);
    }
    // Snap precisely
    flatListRef.current?.scrollToOffset({
      offset: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: string | number | null;
    index: number;
  }) => {
    const isNull = item === null;
    return (
      <Pressable
        onPress={() => {
          if (index < 2) {
            return;
          }
          flatListRef.current?.scrollToIndex({
            index: index - 2,
            animated: true,
          });
        }}
        className="justify-center items-center"
        style={[{ width, height: ITEM_HEIGHT }]}
      >
        {!isNull && <Body numberOfLines={1}>{item}</Body>}
      </Pressable>
    );
  };

  return (
    <View className="overflow-hidden" style={[{ width }]}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        bounces={false}
        style={{ height: PICKER_HEIGHT }}
      />
    </View>
  );
}
