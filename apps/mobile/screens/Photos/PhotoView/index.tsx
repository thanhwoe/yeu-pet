import { LikeButton } from "@/components/LikeButton";
import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IPhoto } from "@/interfaces";
import {
  deletePhotoMutation,
  getPhotoStatsQuery,
  toggleLikePhotoMutation,
} from "@/services";
import { abbreviateNumber } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { TrashIcon } from "phosphor-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PHOTO_PREVIEW_SIZE } from "../util";

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

const DeleteIcon = withIconClassName(TrashIcon);

export const PhotoView = ({ data, deleteAble, onDismiss }: IProps) => {
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();

  const { mutate: toggleLikePhoto, isPending: isTogglingLike } = useMutation({
    mutationFn: toggleLikePhotoMutation,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(data.id) });
    },
    onError(e: MutationError) {
      Toast.error({
        text: e.errors?.[0]?.message ?? "Failed to update photo like",
      });
    },
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

  return (
    <View style={styles.container}>
      <View className="mb-12 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-12 pr-12">
          {data.accounts.avatar_url && (
            <Image
              source={{ uri: data.accounts.avatar_url || "" }}
              style={styles.avatar}
            />
          )}
          <Text
            variant="subhead"
            numberOfLines={1}
            className="flex-1 font-medium text-text-primary-inverse"
          >
            {data.accounts.first_name} {data.accounts.last_name}
          </Text>
        </View>
        {deleteAble && (
          <TouchableOpacity
            accessibilityLabel="Delete photo"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => deletePhoto({ id: data.id })}
            disabled={isDeleting}
            className="h-40 w-40 items-center justify-center rounded-full bg-black/30"
          >
            <DeleteIcon size={22} className="text-white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.photoFrame}>
        <Image source={{ uri: data.url }} style={styles.photo} />

        {data.caption && (
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            tint={colorScheme}
            className="absolute bottom-12 left-12 right-12 overflow-hidden rounded-16 border-hairline border-line-primary-inverse/40 px-12 py-8"
          >
            <Text className="text-text-primary-inverse font-medium">
              {data.caption}
            </Text>
          </BlurView>
        )}
      </View>

      <View className="mt-20 items-center">
        <LikeButton
          disabled={isTogglingLike || isLoadingStats}
          active={photoStats?.liked}
          className="self-center"
          onPress={() => toggleLikePhoto({ id: data.id })}
          label={`${abbreviateNumber(photoStats?.likes || 0)} Likes`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  container: {
    width: PHOTO_PREVIEW_SIZE,
  },
  photo: {
    height: "100%",
    width: "100%",
  },
  photoFrame: {
    borderRadius: 24,
    height: PHOTO_PREVIEW_SIZE,
    overflow: "hidden",
    width: PHOTO_PREVIEW_SIZE,
  },
});
