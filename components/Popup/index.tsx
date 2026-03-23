import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { CheckIcon, TrashIcon } from "phosphor-react-native";
import React, { memo, useEffect, useRef } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../ui/Button";
import { Body } from "../ui/Typography";

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 260,
  mass: 0.8,
};

const ConfirmIcon = withIconClassName(CheckIcon);

const DeleteIcon = withIconClassName(TrashIcon);

interface IProps {
  visible: boolean;
  variant?: "confirm" | "delete";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const Popup = memo<IProps>(
  ({
    visible,
    variant = "confirm",
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading,
  }) => {
    const isDelete = variant === "delete";

    const backdropOpacity = useSharedValue(0);
    const cardScale = useSharedValue(0.82);
    const cardOpacity = useSharedValue(0);
    const cardTranslateY = useSharedValue(24);

    const open = () => {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      cardScale.value = withSpring(1, SPRING_CONFIG);
      cardOpacity.value = withTiming(1, { duration: 180 });
      cardTranslateY.value = withSpring(0, SPRING_CONFIG);
    };

    const close = (callback: () => void) => {
      backdropOpacity.value = withTiming(0, { duration: 180 });
      cardScale.value = withSpring(0.88, { damping: 22, stiffness: 300 });
      cardOpacity.value = withTiming(0, { duration: 160 });
      cardTranslateY.value = withTiming(16, { duration: 160 }, () => {
        if (callback) runOnJS(callback)();
      });
    };

    useEffect(() => {
      if (visible) {
        open();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const prevLoading = useRef<boolean | undefined>(undefined);

    useEffect(() => {
      if (prevLoading.current === true && loading === false) {
        close(onConfirm);
      }
      prevLoading.current = loading;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    const handleCancel = () => {
      if (loading) return;
      close(onCancel);
    };

    const handleConfirm = () => {
      if (loading) return;

      if (loading === undefined) {
        close(onConfirm);
      } else {
        onConfirm();
      }
    };

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
      opacity: cardOpacity.value,
      transform: [
        { scale: cardScale.value },
        { translateY: cardTranslateY.value },
      ],
    }));

    if (!visible) return null;

    return (
      <Modal
        transparent
        animationType="none"
        visible={visible}
        onRequestClose={handleCancel}
      >
        {/* Backdrop */}
        <Animated.View
          className="flex-1 items-center justify-center px-24 bg-black/50"
          style={[backdropStyle]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancel}
          />

          {/* Card */}
          <Animated.View
            className="w-full max-w-[360px] bg-background-foreground rounded-18 py-24 items-center elevation-xl"
            style={[cardStyle]}
          >
            {/* Icon badge */}
            <View
              className={cn(
                "size-64 rounded-full items-center justify-center mb-20",
                {
                  "bg-background-negative-foreground": isDelete,
                  "bg-background-positive-foreground": !isDelete,
                },
              )}
            >
              {isDelete ? (
                <DeleteIcon className="text-icon-negative" size={26} />
              ) : (
                <ConfirmIcon className="text-icon-positive" size={28} />
              )}
            </View>

            {/* Text */}
            <View className="px-24 items-center">
              <Body weight="bold" numberOfLines={1}>
                {title}
              </Body>
              <Body variant="body3" center numberOfLines={2}>
                {description}
              </Body>
            </View>

            {/* Actions */}
            <View className="flex-row gap-12 mt-40 px-24">
              <Button
                onPress={handleCancel}
                disabled={loading}
                wrapperClassName="flex-1"
                variant="cancel"
              >
                {cancelLabel}
              </Button>
              <Button
                onPress={handleConfirm}
                loading={loading}
                wrapperClassName="flex-1"
                variant={isDelete ? "destructive" : "secondary"}
              >
                {confirmLabel}
              </Button>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  },
);

Popup.displayName = "Popup";
