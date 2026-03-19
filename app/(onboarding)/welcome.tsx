import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ArrayElement } from "@/interfaces";
import { completeOnboardingMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { cn } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightIcon } from "phosphor-react-native";
import React, { useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const ArrowRight = withIconClassName(ArrowRightIcon);
const IMAGE_WIDTH = 286;
const IMAGE_HEIGHT = 347;

const getData = () => [
  {
    image: require("../../assets/images/onboarding-1.png"),
    title: "Find pet care services around your location",
    subtitle:
      "Just turn on your location and you will find the nearest pet care you wish.",
  },
  {
    image: require("../../assets/images/onboarding-2.png"),
    title: "Let us give the best treatment",
    subtitle:
      "Get the best treatment for your animal with us. We will take care of the rest.",
  },
  {
    image: require("../../assets/images/onboarding-3.png"),
    title: "Book appointment with us!",
    subtitle: "What do you think? book our veterinarians now.",
  },
];

export default function WelcomeScreen() {
  const DATA = useRef(getData()).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { updateUser, logout } = useUserInfoStore();

  const { mutate, isPending } = useMutation({
    mutationFn: completeOnboardingMutation,
    onSuccess: (res) => {
      Toast.success({ text: "Onboarding successfully" });
      updateUser(res);
    },
    onError: (e) => {
      Toast.error({ text: e.message });
      logout();
    },
  });

  const lastIndex = DATA.length - 1;

  const scrollToIndex = (index: number) => {
    if (flatListRef.current && index >= 0 && index <= lastIndex) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<ArrayElement<typeof DATA>>[];
  }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const handleCompleteOnboarding = () => {
    mutate();
  };

  const handleGoNext = () => {
    if (currentIndex === lastIndex) {
      handleCompleteOnboarding();
    } else {
      scrollToIndex(currentIndex + 1);
    }
  };

  const renderItem: ListRenderItem<ArrayElement<typeof DATA>> = ({
    item,
    index,
  }) => {
    const singleTap = Gesture.Tap().onEnd((event) => {
      const tapPercentage = (event.absoluteX / SCREEN_WIDTH) * 100;
      if (tapPercentage <= 50) {
        runOnJS(scrollToIndex)(index - 1);
      } else {
        if (index === lastIndex) {
          return runOnJS(handleCompleteOnboarding)();
        }
        runOnJS(scrollToIndex)(index + 1);
      }
    });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        // Handle double tap if needed
      });

    const composedGesture = Gesture.Exclusive(doubleTap, singleTap);

    return (
      <GestureDetector gesture={composedGesture}>
        <View
          className="flex-1 items-center justify-between"
          style={{ width: SCREEN_WIDTH }}
        >
          <View className="bg-transparent" />
          <Image
            source={item.image}
            contentFit="cover"
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            }}
          />
          <View className="items-center px-6 gap-3">
            <Text variant="largeTitle" className="text-center">
              {item.title}
            </Text>
            <Text variant="body2" className="text-center">
              {item.subtitle}
            </Text>
          </View>
        </View>
      </GestureDetector>
    );
  };

  return (
    <View className="py-safe-or-4 bg-white flex-1 px-4">
      <View className="flex-row gap-4 mx-auto my-4">
        {DATA.map((_, index) => (
          <Pressable
            key={index}
            hitSlop={{
              bottom: 12,
              top: 12,
              left: 8,
              right: 8,
            }}
            className={cn(
              "flex-1 h-1 bg-orange-200 rounded-xl",
              index <= currentIndex && "bg-orange-400",
            )}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
      <FlatList
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        data={DATA}
        horizontal
        renderItem={renderItem}
        keyExtractor={(item, index) => item.title + index.toString()}
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        onViewableItemsChanged={onViewableItemsChanged}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      <View className="flex-row justify-between py-8 px-4">
        <Button
          variant="ghost"
          disabled={isPending}
          onPress={handleCompleteOnboarding}
        >
          Skip
        </Button>
        <TouchableOpacity
          onPress={handleGoNext}
          disabled={isPending}
          className="bg-orange-400 p-3 rounded-full"
        >
          <ArrowRight weight="bold" className="text-stone-100" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
