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
  variant?: "confirm" | "delete" | "alert";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const Popup = memo<IProps>(
  ({
    visible,
    variant = "alert",
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading,
  }) => {
    const isDelete = variant === "delete";
    const showStatusIcon = variant !== "alert";

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

    const close = (callback?: () => void) => {
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
        onConfirm?.();
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
        presentationStyle="overFullScreen"
      >
        {/* Backdrop */}
        <Animated.View
          className="flex-1 items-center justify-center bg-background-scrim/55 px-24"
          style={[backdropStyle]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancel}
          />

          {/* Card */}
          <Animated.View
            className="w-full max-w-[360px] items-center rounded-24 border border-line-subtle bg-background-surface px-20 py-24 shadow-card"
            style={[cardStyle]}
          >
            {/* Icon badge */}
            <View
              className={cn(
                "mb-18 size-60 items-center justify-center rounded-full border",
                {
                  "border-status-danger-border bg-status-danger-surface":
                    isDelete,
                  "border-status-success-border bg-status-success-surface":
                    !isDelete,
                  hidden: !showStatusIcon,
                },
              )}
            >
              {isDelete ? (
                <DeleteIcon className="text-status-danger-icon" size={26} />
              ) : (
                <ConfirmIcon className="text-status-success-icon" size={28} />
              )}
            </View>

            {/* Text */}
            <View className="items-center px-4">
              <Body
                weight="bold"
                numberOfLines={2}
                center
                className="text-text-primary"
              >
                {title}
              </Body>
              {!!description && (
                <Body
                  variant="body3"
                  center
                  numberOfLines={4}
                  className="mt-8 text-text-muted"
                >
                  {description}
                </Body>
              )}
            </View>

            {/* Actions */}
            <View className="mt-28 flex-row gap-12 self-stretch">
              <Button
                onPress={handleCancel}
                disabled={loading}
                wrapperClassName="flex-1"
                variant={onConfirm ? "cancel" : "secondary"}
              >
                {cancelLabel}
              </Button>
              {!!onConfirm && (
                <Button
                  onPress={handleConfirm}
                  loading={loading}
                  wrapperClassName="flex-1"
                  variant={isDelete ? "destructive" : "secondary"}
                >
                  {confirmLabel}
                </Button>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  },
);

Popup.displayName = "Popup";
