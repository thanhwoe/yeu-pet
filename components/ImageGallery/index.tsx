import { withIconClassName } from "@/hocs/withIconClassName";
import { StatusBar } from "expo-status-bar";
import { XIcon } from "phosphor-react-native";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Gallery,
  stackTransition,
  type GalleryRefType,
} from "react-native-zoom-toolkit";
import { ImageItem } from "./ImageItem";

const CloseIcon = withIconClassName(XIcon);

interface IProps {
  data: string[];
}

export interface ImageGalleryRef {
  open: (index?: number) => void;
  close: () => void;
}

export const ImageGallery = memo(
  forwardRef<ImageGalleryRef, IProps>(({ data }, ref) => {
    const galleryRef = useRef<GalleryRefType>(null);
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);

    const activeIndex = useSharedValue<number>(0);
    const translateY = useSharedValue<number>(0);

    useImperativeHandle(
      ref,
      useCallback(
        () => ({
          open: (index?: number) => {
            setIndex(index ?? 0);
            setVisible(true);
          },
          close: () => setVisible(false),
        }),
        [],
      ),
    );

    const renderItem = useCallback(
      (item: string, index: number) => {
        return <ImageItem uri={item} index={index} activeIndex={activeIndex} />;
      },
      [activeIndex],
    );

    const keyExtractor = useCallback((item: string, index: number) => {
      return `${item}-${index}`;
    }, []);

    const onVerticalPulling = (ty: number) => {
      "worklet";
      translateY.value = ty;
    };

    const animatedStyle = useAnimatedStyle(() => {
      const color = interpolateColor(
        translateY.value,
        [-150, 0, 150],
        ["#ccc", "#000", "#ccc"],
        "RGB",
        { gamma: 2.2 },
      );

      return { backgroundColor: color };
    });

    const transition = useCallback(stackTransition, []);

    return (
      <Modal
        transparent
        animationType="none"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <View className="absolute top-safe-offset-16 right-20 z-10">
            <TouchableOpacity onPress={() => setVisible(false)}>
              <CloseIcon className="text-grey-0" weight="bold" />
            </TouchableOpacity>
          </View>
          <Gallery
            ref={galleryRef}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialIndex={index}
            onIndexChange={(idx) => {
              activeIndex.value = idx;
            }}
            pinchMode="free"
            onVerticalPull={onVerticalPulling}
            customTransition={transition}
          />

          <StatusBar style="light" translucent={true} />
        </Animated.View>
      </Modal>
    );
  }),
);

ImageGallery.displayName = "ImageGallery";
