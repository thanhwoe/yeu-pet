import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/common";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { PhotoCommentsSheet } from "@/features/photos/components/PhotoCommentsSheet";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPhoto, IPagination } from "@/interfaces";
import {
  deletePhotoMutation,
  getPhotoStatsQuery,
  toggleLikePhotoMutation,
  unlikePhotoMutation,
} from "@/services";
import { abbreviateNumber } from "@/utils";
import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChatCircleTextIcon,
  HeartIcon,
  TrashIcon,
  XIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IProps {
  data: IPhoto;
  active?: boolean;
  deleteAble?: boolean;
  pageHeight?: number;
  pageWidth?: number;
  onDeleted?: (photoId: string) => void;
  onDismiss?: () => void;
  onInteractionChange?: (locked: boolean) => void;
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
type PhotoListCache = InfiniteData<IPagination<IPhoto>, number>;

export const PhotoView = ({
  data,
  active = true,
  deleteAble,
  pageHeight = SCREEN_HEIGHT,
  pageWidth = SCREEN_WIDTH,
  onDeleted,
  onDismiss,
  onInteractionChange,
}: IProps) => {
  const [showComments, setShowComments] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const commentsOpenRef = useRef(false);
  const initialLiked = data.liked ?? false;
  const initialLikes = data.likes ?? data.likeCount ?? 0;
  const [localLiked, setLocalLiked] = useState(initialLiked);
  const [localLikes, setLocalLikes] = useState(initialLikes);
  const [localComments, setLocalComments] = useState(
    data.comments ?? data.commentCount ?? 0,
  );
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const photo = data as PhotoWithCamelAliases;
  const desiredLikedRef = useRef(initialLiked);
  const serverLikedRef = useRef(initialLiked);
  const serverLikesRef = useRef(initialLikes);
  const isSyncingLikeRef = useRef(false);

  const account = useMemo(
    () => ({
      id:
        photo.accounts.id ??
        photo.accounts.accountId ??
        photo.accounts.account_id,
      avatarUrl: photo.accounts.avatarUrl ?? photo.accounts.avatar_url,
      firstName: photo.accounts.firstName ?? photo.accounts.first_name,
      lastName: photo.accounts.lastName ?? photo.accounts.last_name,
    }),
    [photo.accounts],
  );
  const ownerId = photo.accountId ?? photo.account_id ?? account.id ?? "";
  const containerStyle = useMemo(
    () => ({ height: pageHeight, width: pageWidth }),
    [pageHeight, pageWidth],
  );
  const topGradientStyle = useMemo(
    () => ({ height: pageHeight * 0.22 }),
    [pageHeight],
  );
  const bottomGradientStyle = useMemo(
    () => ({ height: pageHeight * 0.42 }),
    [pageHeight],
  );

  const removePhotoFromListCache = useCallback(
    (photoId: string) => {
      queryClient.setQueriesData<PhotoListCache>(
        { queryKey: PHOTOS_KEY.lists() },
        (current) => {
          if (
            !current ||
            !current.pages.some((page) =>
              page.data.some((item) => item.id === photoId),
            )
          ) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.id !== photoId),
              meta: {
                ...page.meta,
                total: Math.max(0, page.meta.total - 1),
              },
            })),
          };
        },
      );
      queryClient.removeQueries({ queryKey: PHOTOS_KEY.detail(photoId) });
    },
    [queryClient],
  );

  const { mutate: toggleLikePhoto } = useMutation({
    mutationFn: toggleLikePhotoMutation,
  });
  const { mutate: unlikePhoto } = useMutation({
    mutationFn: unlikePhotoMutation,
  });

  const { mutate: deletePhoto, isPending: isDeleting } = useMutation({
    mutationFn: deletePhotoMutation,
    onSuccess() {
      removePhotoFromListCache(data.id);
      Toast.success({
        title: "Photo removed",
        text: "The photo is no longer visible in your feed.",
      });
      void queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });

      if (onDeleted) {
        onDeleted(data.id);
      } else {
        onDismiss?.();
      }
    },
    onError(e: MutationError) {
      Toast.error({
        title: "Photo not removed",
        text: e.errors?.[0]?.message ?? "Refresh the photo and try again.",
      });
    },
    onSettled() {
      onInteractionChange?.(false);
    },
  });

  const { data: photoStats } = useQuery({
    queryKey: PHOTOS_KEY.detail(data.id),
    queryFn: () => getPhotoStatsQuery({ id: data.id }),
    enabled: active,
  });

  useEffect(() => {
    if (photoStats) {
      const nextServerLiked = photoStats.liked ?? false;
      const nextServerLikes = photoStats.likes ?? photoStats.likeCount ?? 0;

      serverLikedRef.current = nextServerLiked;
      serverLikesRef.current = nextServerLikes;

      if (!isSyncingLikeRef.current) {
        desiredLikedRef.current = nextServerLiked;
        setLocalLiked(nextServerLiked);
        setLocalLikes(nextServerLikes);
      }

      setLocalComments(photoStats.comments ?? photoStats.commentCount ?? 0);
    }
  }, [photoStats]);

  useEffect(() => {
    setHasImageError(false);
  }, [data.id]);

  const syncLikeToServer = useCallback(() => {
    if (isSyncingLikeRef.current) {
      return;
    }

    if (desiredLikedRef.current === serverLikedRef.current) {
      return;
    }

    isSyncingLikeRef.current = true;
    const syncMutation = desiredLikedRef.current
      ? toggleLikePhoto
      : unlikePhoto;

    syncMutation(
      { id: data.id },
      {
        onSuccess(updatedPhoto) {
          const serverLiked = updatedPhoto.liked ?? desiredLikedRef.current;
          const serverLikes =
            updatedPhoto.likes ??
            updatedPhoto.likeCount ??
            serverLikesRef.current;

          serverLikedRef.current = serverLiked;
          serverLikesRef.current = serverLikes;

          if (desiredLikedRef.current === serverLiked) {
            setLocalLiked(serverLiked);
            setLocalLikes(serverLikes);
          }

          setLocalComments(
            (current) =>
              updatedPhoto.comments ?? updatedPhoto.commentCount ?? current,
          );
          queryClient.invalidateQueries({
            queryKey: PHOTOS_KEY.detail(data.id),
          });
          queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
        },
        onError(e: MutationError) {
          desiredLikedRef.current = serverLikedRef.current;
          setLocalLiked(serverLikedRef.current);
          setLocalLikes(serverLikesRef.current);
          Toast.error({
            title: "Reaction not saved",
            text:
              e.errors?.[0]?.message ??
              "Check your connection and try reacting again.",
          });
        },
        onSettled() {
          isSyncingLikeRef.current = false;

          if (desiredLikedRef.current !== serverLikedRef.current) {
            syncLikeToServer();
          }
        },
      },
    );
  }, [data.id, queryClient, toggleLikePhoto, unlikePhoto]);

  const handleToggleLike = useCallback(() => {
    const nextLiked = !desiredLikedRef.current;
    desiredLikedRef.current = nextLiked;

    setLocalLiked(nextLiked);
    setLocalLikes((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    syncLikeToServer();
  }, [syncLikeToServer]);

  const handleOpenComments = useCallback(() => {
    commentsOpenRef.current = true;
    setShowComments(true);
    onInteractionChange?.(true);
  }, [onInteractionChange]);
  const handleDismissComments = useCallback(() => {
    commentsOpenRef.current = false;
    setShowComments(false);
    onInteractionChange?.(false);
  }, [onInteractionChange]);
  const handleDeletePress = useCallback(() => {
    Alert.alert(
      "Delete this photo?",
      "This removes the photo from My Photos and the social feed if it was public.",
      [
        { text: "Keep photo", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePhoto({ id: data.id }),
        },
      ],
    );
  }, [data.id, deletePhoto]);

  useEffect(
    () => () => {
      if (commentsOpenRef.current) {
        onInteractionChange?.(false);
      }
    },
    [onInteractionChange],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {!hasImageError ? (
        <Image
          source={{ uri: data.url }}
          style={styles.photo}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-8 px-32">
          <Text variant="heading" className="text-center text-white">
            Photo unavailable
          </Text>
          <Text
            variant="body2"
            className="text-center text-text-tertiary-inverse"
          >
            Swipe to another photo or close the viewer and try again.
          </Text>
        </View>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.42)", "rgba(0,0,0,0)"]}
        style={[styles.topGradient, topGradientStyle]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]}
        style={[styles.bottomGradient, bottomGradientStyle]}
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
          accessibilityLabel={localLiked ? "Unlike photo" : "Like photo"}
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
          icon={<CommentIcon size={31} weight="bold" className="text-white" />}
          label={abbreviateNumber(localComments)}
          onPress={handleOpenComments}
        />

        {deleteAble && (
          <ActionButton
            accessibilityLabel="Delete photo"
            disabled={isDeleting}
            icon={<DeleteIcon size={29} weight="bold" className="text-white" />}
            label="Delete"
            onPress={handleDeletePress}
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
        onCommentCountChange={setLocalComments}
        onDismiss={handleDismissComments}
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
    left: 0,
    position: "absolute",
    right: 0,
  },
  container: {
    backgroundColor: "#000",
    overflow: "hidden",
  },
  photo: {
    height: "100%",
    width: "100%",
  },
  topGradient: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
