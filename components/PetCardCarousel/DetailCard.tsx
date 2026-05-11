import { withIconClassName } from "@/hocs/withIconClassName";
import { IPet } from "@/interfaces";
import { cn } from "@/utils";
import { calculateAnimalAge } from "@/utils/pet";
import dayjs from "dayjs";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "phosphor-react-native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Avatar } from "../ui/Avatar";
import { Image } from "../ui/Image";
import { Body, Heading } from "../ui/Typography";
import {
  CARD_HEIGHT,
  CARD_THEME,
  CARD_WIDTH,
  SCALE_CENTER,
  SCALE_SIDE,
  seedColorRandom,
} from "./utils";

const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const FrontIcon = withIconClassName(ArrowUpRightIcon);
const BackIcon = withIconClassName(ArrowDownLeftIcon);

interface IProps {
  onEdit: (value: IPet) => void;
  onDelete: (value: IPet) => void;
  pet: IPet;
  isCenter: boolean;
  index: number;
  scrollX: SharedValue<number>;
}

export const DetailCard = memo<IProps>(
  ({ pet, isCenter, index, scrollX, onDelete, onEdit }) => {
    const rotation = useSharedValue(0);
    const [flipped, setFlipped] = useState(false);
    const theme =
      CARD_THEME[index] ??
      CARD_THEME[seedColorRandom(index, CARD_THEME.length)];

    const flip = useCallback(() => {
      const toValue = flipped ? 0 : 180;
      rotation.value = withTiming(toValue, { duration: 500 }, () => {
        runOnJS(setFlipped)(!flipped);
      });
    }, [flipped, rotation]);

    useEffect(() => {
      if (!isCenter && flipped) {
        flip();
      }
    }, [flip, flipped, isCenter]);

    const zoomStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
      ];
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [SCALE_SIDE, SCALE_CENTER, SCALE_SIDE],
        Extrapolation.CLAMP,
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.65, 1, 0.65],
        Extrapolation.CLAMP,
      );
      return { transform: [{ scale }], opacity };
    });

    const frontStyle = useAnimatedStyle(() => {
      const rot = interpolate(
        rotation.value,
        [0, 180],
        [0, 180],
        Extrapolation.CLAMP,
      );
      // front is visible when rotation < 90 deg
      const isVisible = rotation.value < 90;
      return {
        transform: [{ rotateY: `${rot}deg` }],
        backfaceVisibility: "hidden",
        position: "absolute",
        width: "100%",
        height: "100%",
        pointerEvents: isVisible ? "auto" : "none",
      };
    });

    const backStyle = useAnimatedStyle(() => {
      const rot = interpolate(
        rotation.value,
        [0, 180],
        [180, 360],
        Extrapolation.CLAMP,
      );
      // back is visible when rotation >= 90 deg
      const isVisible = rotation.value >= 90;
      return {
        transform: [{ rotateY: `${rot}deg` }],
        backfaceVisibility: "hidden",
        position: "absolute",
        width: "100%",
        height: "100%",
        pointerEvents: isVisible ? "auto" : "none",
      };
    });

    const age = useMemo(() => {
      if (!pet.birthdate) {
        return "";
      }
      const result = calculateAnimalAge(pet.birthdate, pet.species);

      if (!result) {
        return "";
      }

      return `${result.years} Years · ${result.humanYears} Human Years`;
    }, [pet.birthdate, pet.species]);

    return (
      <Animated.View
        className="relative"
        style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, zoomStyle]}
      >
        {/* FRONT */}
        <Animated.View
          className={cn(
            "rounded-28 p-20 overflow-hidden justify-end shadow-shadow-primary elevation-xl",
            theme.color,
          )}
          style={[frontStyle]}
        >
          {/* Paw watermark */}

          <Text className="absolute bottom-10 right-0 text-[120px] z-10 opacity-10">
            🐾
          </Text>

          {/* photo area */}
          <View
            className={cn(
              "absolute top-0 left-0 right-0 justify-center items-center rounded-28 ",
              theme.accentColor,
            )}
            style={[
              {
                height: CARD_HEIGHT * 0.62,
              },
            ]}
          >
            {pet.avatarUrl ? (
              <Image
                contentFit="cover"
                source={{
                  uri: pet.avatarUrl ?? undefined,
                }}
                style={[
                  {
                    height: CARD_HEIGHT * 0.62,
                    width: CARD_WIDTH,
                  },
                ]}
              />
            ) : (
              <Text className="text-[120px] opacity-80">🐾</Text>
            )}
          </View>

          {/* Name + info */}
          <View
            style={{
              marginTop: CARD_HEIGHT * 0.64,
            }}
          >
            <Heading
              variant="h4"
              weight="bold"
              className="text-white capitalize"
              numberOfLines={3}
            >
              {pet.name}
            </Heading>
            <Body variant="body2" className="text-white capitalize">
              {pet.gender}
            </Body>
            <Body variant="body2" className="text-white capitalize">
              {age}
            </Body>
          </View>

          {/* Flip button */}
          {isCenter && (
            <View className="z-20 absolute top-18 right-18 gap-16">
              <Pressable
                className={cn(
                  " size-36 rounded-18 items-center justify-center shadow-shadow-primary elevation-md",
                  theme.color,
                )}
                onPress={flip}
              >
                <FrontIcon className={theme.icon} weight="bold" size={20} />
              </Pressable>
              <Pressable
                className={cn(
                  "size-36 rounded-18 items-center justify-center shadow-shadow-primary elevation-md",
                  theme.color,
                )}
                onPress={() => onEdit(pet)}
              >
                <EditIcon weight="bold" size={20} className={theme.icon} />
              </Pressable>
              <Pressable
                className={cn(
                  " size-36 rounded-18 items-center justify-center shadow-shadow-primary elevation-md",
                  theme.color,
                )}
                onPress={() => onDelete(pet)}
              >
                <DeleteIcon weight="bold" size={20} className={theme.icon} />
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* BACK */}
        <Animated.View
          className={cn(
            "rounded-28 p-20 shadow-shadow-primary elevation-xl overflow-hidden justify-start",
            theme.color,
          )}
          style={[backStyle]}
        >
          {/* Header */}
          <View
            className={cn(
              "flex-row items-center gap-12 rounded-16 p-14 mb-16",
              theme.accentColor,
            )}
          >
            <View>
              <Avatar
                source={{
                  uri: pet.avatarUrl ?? undefined,
                }}
              />
            </View>
            <View>
              <Body className="text-white capitalize">{pet.name}</Body>
              <Body variant="body2" className="text-white capitalize">
                {pet.breed}
              </Body>
            </View>
          </View>

          {/* Detail rows */}
          <View className="flex-row flex-wrap gap-10 mb-14">
            <DetailItem
              label="Gender"
              value={pet.gender}
              color={theme.detail}
            />
            <DetailItem
              label="Birthdate"
              value={dayjs(pet.birthdate).format("l")}
              color={theme.detail}
            />
            <DetailItem
              label="Weight"
              value={pet.weight ?? ""}
              color={theme.detail}
            />
            <DetailItem
              label="Fur color"
              value={pet.color ?? ""}
              color={theme.detail}
            />
          </View>

          {/* Bio */}
          <View className={cn("rounded-14 p-12", theme.detail)}>
            <Body variant="body5" caps className="mb-6 text-grey-80">
              About
            </Body>
            <Body
              variant="body3"
              weight="semiBold"
              numberOfLines={2}
              className="text-black"
            >
              {pet.notes}
            </Body>
          </View>

          {/* Flip back button */}
          <TouchableOpacity
            className={cn(
              "absolute top-18 right-18 size-36 rounded-18 justify-center items-center shadow-shadow-primary elevation-md",
              theme.color,
            )}
            onPress={flip}
            activeOpacity={0.8}
          >
            <BackIcon className={theme.icon} weight="bold" size={20} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  },
);

DetailCard.displayName = "DetailCard";

const DetailItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View className={cn("w-[48%] bg-pink-10 rounded-12 p-10", color)}>
    <Body variant="body5" caps className="mb-14 text-grey-80">
      {label}
    </Body>
    <Body
      variant="body3"
      weight="semiBold"
      className="capitalize text-black"
      numberOfLines={1}
    >
      {value}
    </Body>
  </View>
);
