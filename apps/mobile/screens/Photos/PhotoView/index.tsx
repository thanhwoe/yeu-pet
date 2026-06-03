import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/common";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPhoto } from "@/interfaces";
import {
  deletePhotoMutation,
  getPhotoStatsQuery,
  toggleLikePhotoMutation,
} from "@/services";
import { abbreviateNumber } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChatCircleTextIcon,
  HeartIcon,
  TrashIcon,
  XIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoCommentsSheet } from "../PhotoCommentsSheet";

interface IProps {
  data: IPhoto;
  deleteAble?: boolean;
  onDismiss?: () => void;
}

type MutationError = {
  errors?: {
    message: string;
  }[];
};

type PhotoAccount = IPhoto["accounts"] & {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
};

type PhotoWithCamelAliases = IPhoto & {
  accountId?: string;
  accounts: PhotoAccount;
};

const CloseIcon = withIconClassName(XIcon);
const CommentIcon = withIconClassName(ChatCircleTextIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const Heart = withIconClassName(HeartIcon);

export const PhotoView = ({ data, deleteAble, onDismiss }: IProps) => {
  const [showComments, setShowComments] = useState(false);
  const [localLiked, setLocalLiked] = useState(data.liked ?? false);
  const [localLikes, setLocalLikes] = useState(
    data.likes ?? data.likeCount ?? 0,
  );
  const [localComments, setLocalComments] = useState(
    data.comments ?? data.commentCount ?? 0,
  );
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const photo = data as PhotoWithCamelAliases;

  const account = useMemo(
    () => ({
      id: photo.accounts.id ?? photo.accounts.accountId ?? photo.accounts.account_id,
      avatarUrl: photo.accounts.avatarUrl ?? photo.accounts.avatar_url,
      firstName: photo.accounts.firstName ?? photo.accounts.first_name,
      lastName: photo.accounts.lastName ?? photo.accounts.last_name,
    }),
    [photo.accounts],
  );
  const ownerId = photo.accountId ?? photo.account_id ?? account.id ?? "";

  const { mutate: toggleLikePhoto, isPending: isTogglingLike } = useMutation({
    mutationFn: toggleLikePhotoMutation,
  });

  const { mutate: deletePhoto, isPending: isDeleting } = useMutation({
    mutationFn: deletePhotoMutation,
    onSuccess() {
      Toast.success({ text: "Delete photo successfully" });
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      onDismiss?.();
    },
    onError(e: MutationError) {
      Toast.error({
        text: e.errors?.[0]?.message ?? "Failed to delete photo",
      });
    },
  });

  const { data: photoStats, isFetching: isLoadingStats } = useQuery({
    queryKey: PHOTOS_KEY.detail(data.id),
    queryFn: () => getPhotoStatsQuery({ id: data.id }),
  });

  useEffect(() => {
    if (photoStats) {
      setLocalLiked(photoStats.liked ?? false);
      setLocalLikes(photoStats.likes ?? photoStats.likeCount ?? 0);
      setLocalComments(photoStats.comments ?? photoStats.commentCount ?? 0);
    }
  }, [photoStats]);

  const handleToggleLike = useCallback(() => {
    const previousLiked = localLiked;
    const previousLikes = localLikes;
    const nextLiked = !previousLiked;

    setLocalLiked(nextLiked);
    setLocalLikes(Math.max(0, previousLikes + (nextLiked ? 1 : -1)));

    toggleLikePhoto(
      { id: data.id },
      {
        onSuccess(updatedPhoto) {
          setLocalLiked(updatedPhoto.liked ?? nextLiked);
          setLocalLikes(updatedPhoto.likes ?? updatedPhoto.likeCount ?? 0);
          setLocalComments(
            updatedPhoto.comments ?? updatedPhoto.commentCount ?? localComments,
          );
          queryClient.invalidateQueries({
            queryKey: PHOTOS_KEY.detail(data.id),
          });
          queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
        },
        onError(e: MutationError) {
          setLocalLiked(previousLiked);
          setLocalLikes(previousLikes);
          Toast.error({
            text: e.errors?.[0]?.message ?? "Failed to update photo like",
          });
        },
      },
    );
  }, [
    data.id,
    localComments,
    localLiked,
    localLikes,
    queryClient,
    toggleLikePhoto,
  ]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: data.url }} style={styles.photo} />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.42)", "rgba(0,0,0,0)"]}
        style={styles.topGradient}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]}
        style={styles.bottomGradient}
      />

      <TouchableOpacity
        accessibilityLabel="Close photo"
        accessibilityRole="button"
        activeOpacity={0.82}
        className="absolute h-44 w-44 items-center justify-center rounded-full bg-black/35"
        onPress={onDismiss}
        style={{ left: 20, top: insets.top + 12 }}
      >
        <CloseIcon size={24} weight="bold" className="text-white" />
      </TouchableOpacity>

      <View
        className="absolute items-center gap-18"
        style={{ bottom: insets.bottom + 112, right: 16 }}
      >
        <ActionButton
          accessibilityLabel="Like photo"
          disabled={isTogglingLike || isLoadingStats}
          icon={
            <Heart
              size={31}
              weight={localLiked ? "fill" : "bold"}
              className={localLiked ? "text-red-50" : "text-white"}
            />
          }
          label={abbreviateNumber(localLikes)}
          onPress={handleToggleLike}
        />

        <ActionButton
          accessibilityLabel="Open comments"
          icon={
            <CommentIcon size={31} weight="bold" className="text-white" />
          }
          label={abbreviateNumber(localComments)}
          onPress={() => setShowComments(true)}
        />

        {deleteAble && (
          <ActionButton
            accessibilityLabel="Delete photo"
            disabled={isDeleting}
            icon={<DeleteIcon size={29} weight="bold" className="text-white" />}
            label="Delete"
            onPress={() => deletePhoto({ id: data.id })}
          />
        )}
      </View>

      <View
        className="absolute left-20 gap-10 pr-88"
        style={{ bottom: insets.bottom + 30 }}
      >
        <View className="flex-row items-center gap-10">
          {account.avatarUrl ? (
            <Image
              source={{ uri: account.avatarUrl }}
              className="h-38 w-38 rounded-full border-hairline border-white/40"
            />
          ) : (
            <View className="h-38 w-38 items-center justify-center rounded-full bg-white/20">
              <Text variant="caption1" className="font-bold text-white">
                {account.firstName?.[0] ?? "?"}
              </Text>
            </View>
          )}
          <Text variant="subhead" className="font-semibold text-white">
            {account.firstName} {account.lastName}
          </Text>
        </View>

        {!!data.caption && (
          <Text
            variant="body2"
            numberOfLines={3}
            className="font-medium text-white"
          >
            {data.caption}
          </Text>
        )}
      </View>

      <PhotoCommentsSheet
        visible={showComments}
        photoId={data.id}
        photoOwnerId={ownerId}
        onDismiss={() => setShowComments(false)}
      />
    </View>
  );
};

const ActionButton = ({
  accessibilityLabel,
  disabled,
  icon,
  label,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    activeOpacity={0.82}
    className="items-center gap-4"
    disabled={disabled}
    onPress={onPress}
  >
    <View className="h-52 w-52 items-center justify-center rounded-full bg-black/35">
      {icon}
    </View>
    <Text
      variant="caption1"
      numberOfLines={1}
      className="max-w-68 text-center font-bold text-white"
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bottomGradient: {
    bottom: 0,
    height: SCREEN_HEIGHT * 0.42,
    left: 0,
    position: "absolute",
    right: 0,
  },
  container: {
    backgroundColor: "#000",
    height: SCREEN_HEIGHT,
    overflow: "hidden",
    width: SCREEN_WIDTH,
  },
  photo: {
    height: "100%",
    width: "100%",
  },
  topGradient: {
    height: SCREEN_HEIGHT * 0.22,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
