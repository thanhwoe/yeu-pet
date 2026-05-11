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
import { TouchableOpacity, View } from "react-native";

interface IProps {
  data: IPhoto;
  deleteAble?: boolean;
  onDismiss?: () => void;
}

const DeleteIcon = withIconClassName(TrashIcon);

export const PhotoView = ({ data, deleteAble, onDismiss }: IProps) => {
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();

  const { mutate: toggleLikePhoto, isPending: isTogglingLike } = useMutation({
    mutationFn: toggleLikePhotoMutation,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(data.id) });
    },
    onError(e) {
      Toast.error({ text: e.errors?.[0].message });
    },
  });

  const { mutate: deletePhoto, isPending: isDeleting } = useMutation({
    mutationFn: deletePhotoMutation,
    onSuccess() {
      Toast.success({ text: "Delete photo successfully" });
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      onDismiss?.();
    },
    onError(e) {
      Toast.error({ text: e.errors?.[0].message });
    },
  });

  const { data: photoStats, isFetching: isLoadingStats } = useQuery({
    queryKey: PHOTOS_KEY.detail(data.id),
    queryFn: () => getPhotoStatsQuery({ id: data.id }),
  });

  return (
    <>
      <View>
        <View className="flex-row mb-3 items-center justify-between">
          <View className="flex-row gap-3 items-center">
            <Image
              source={{ uri: data.accounts.avatar_url || "" }}
              className="size-8 rounded-full"
            />
            <Text className="text-text-primary-inverse font-medium">
              {data.accounts.first_name} {data.accounts.last_name}
            </Text>
          </View>
          {deleteAble && (
            <TouchableOpacity
              onPress={() => deletePhoto({ id: data.id })}
              disabled={isDeleting}
            >
              <DeleteIcon size={24} className="text-text-primary-inverse" />
            </TouchableOpacity>
          )}
        </View>
        <Image source={{ uri: data.url }} className="size-72 rounded-lg" />

        {data.caption && (
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            tint={colorScheme}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-xl overflow-hidden py-1 px-2"
          >
            <Text className="text-text-primary-inverse">{data.caption}</Text>
          </BlurView>
        )}
        <LikeButton
          disabled={isTogglingLike || isLoadingStats}
          active={photoStats?.data?.liked}
          className="self-center absolute -bottom-40"
          onPress={() => toggleLikePhoto({ id: data.id })}
          label={`${abbreviateNumber(photoStats?.data?.likes || 0)} Likes`}
        />
      </View>
    </>
  );
};
