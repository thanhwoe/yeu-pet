import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { PHOTO_COMMENTS_KEY, PHOTOS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPhotoComment } from "@/interfaces";
import {
  createPhotoCommentMutation,
  deletePhotoCommentMutation,
  getPhotoCommentsQuery,
} from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { cn, date } from "@/utils";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChatCircleTextIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
} from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const LIMIT = 20;
const COMMENTS_SHEET_SNAP_POINT = "76%";

const CommentIcon = withIconClassName(ChatCircleTextIcon);
const SendIcon = withIconClassName(PaperPlaneTiltIcon);
const Trash = withIconClassName(TrashIcon);

type MutationError = {
  errors?: {
    message: string;
  }[];
  message?: string;
};

interface PhotoCommentsSheetProps {
  visible: boolean;
  photoId: string;
  photoOwnerId: string;
  onDismiss: () => void;
}

const getErrorMessage = (error: MutationError, fallback: string) =>
  error.errors?.[0]?.message ?? error.message ?? fallback;

export const PhotoCommentsSheet = ({
  visible,
  photoId,
  photoOwnerId,
  onDismiss,
}: PhotoCommentsSheetProps) => {
  const [content, setContent] = useState("");
  const { user } = useUserInfoStore();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: PHOTO_COMMENTS_KEY.list({ photoId, limit: LIMIT }),
    queryFn: ({ pageParam }) =>
      getPhotoCommentsQuery({
        photoId,
        limit: LIMIT,
        page: pageParam,
      }),
    enabled: visible,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;

      return lastPage.meta.page + 1;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
  });

  const commentsQueryKey = useMemo(
    () => PHOTO_COMMENTS_KEY.list({ photoId, limit: LIMIT }),
    [photoId],
  );

  const invalidateComments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(photoId) });
    queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
  }, [commentsQueryKey, photoId, queryClient]);

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    mutationFn: createPhotoCommentMutation,
    onSuccess() {
      setContent("");
      invalidateComments();
    },
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to send comment"),
      });
    },
  });

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: deletePhotoCommentMutation,
    onSuccess() {
      Toast.success({ text: "Comment deleted" });
      invalidateComments();
    },
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to delete comment"),
      });
    },
  });

  const handleSubmit = useCallback(async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      Toast.error({ text: "Please enter a comment" });
      return;
    }

    await createComment({
      photoId,
      content: trimmedContent,
    });
  }, [content, createComment, photoId]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback<ListRenderItem<IPhotoComment>>(
    ({ item }) => (
      <PhotoCommentItem
        comment={item}
        currentUserId={user?.id}
        photoOwnerId={photoOwnerId}
        disabled={isDeleting}
        onDelete={(commentId) => deleteComment({ photoId, commentId })}
      />
    ),
    [deleteComment, isDeleting, photoId, photoOwnerId, user?.id],
  );

  const keyExtractor = useCallback((item: IPhotoComment) => item.id, []);

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      titleElement={<Body weight="semiBold">Comments</Body>}
      useScrollView={false}
      enableDynamicSizing={false}
      snapPoints={[COMMENTS_SHEET_SNAP_POINT]}
      keyboardBehavior="interactive"
      footer={
        <CommentComposer
          content={content}
          isCreating={isCreating}
          onChangeContent={setContent}
          onSubmit={handleSubmit}
        />
      }
    >
      <View style={styles.sheetContent}>
        <View style={styles.commentsFrame}>
          {error && !comments.length ? (
            <CommentErrorState />
          ) : (
            <FlashList
              data={comments}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              estimatedItemSize={92}
              ItemSeparatorComponent={CommentSeparator}
              ListEmptyComponent={<CommentEmptyState isLoading={isLoading} />}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="items-center py-16">
                    <Spinner size={20} />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              contentContainerStyle={styles.commentsContent}
            />
          )}
        </View>
      </View>
    </BottomSheet>
  );
};

const CommentComposer = ({
  content,
  isCreating,
  onChangeContent,
  onSubmit,
}: {
  content: string;
  isCreating: boolean;
  onChangeContent: (value: string) => void;
  onSubmit: () => void;
}) => {
  const isDisabled = !content.trim() || isCreating;

  return (
    <View className="border-t-hairline border-line-tertiary bg-background px-20 py-10">
      <View className="flex-row items-end gap-8 rounded-full bg-background-card-highlight px-14 py-8">
        <BottomSheetTextInput
          value={content}
          onChangeText={onChangeContent}
          placeholder="Write a comment"
          placeholderTextColor="rgba(113, 120, 134, 0.75)"
          multiline
          maxLength={300}
          className="max-h-88 min-h-34 flex-1 text-body3 text-text-primary"
        />
        <TouchableOpacity
          accessibilityLabel="Send comment"
          accessibilityRole="button"
          activeOpacity={0.82}
          className={cn(
            "h-36 w-36 items-center justify-center rounded-full bg-background-primary",
            isDisabled && "opacity-50",
          )}
          disabled={isDisabled}
          onPress={onSubmit}
        >
          {isCreating ? (
            <Spinner size={17} className="text-icon-primary-inverse" />
          ) : (
            <SendIcon
              size={18}
              weight="bold"
              className="text-icon-primary-inverse"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PhotoCommentItem = ({
  comment,
  currentUserId,
  photoOwnerId,
  disabled,
  onDelete,
}: {
  comment: IPhotoComment;
  currentUserId?: string;
  photoOwnerId: string;
  disabled: boolean;
  onDelete: (commentId: string) => void;
}) => {
  const canDelete =
    currentUserId === comment.accountId || currentUserId === photoOwnerId;

  const handleDelete = useCallback(() => {
    onDelete(comment.id);
  }, [comment.id, onDelete]);

  return (
    <View className="flex-row gap-10">
      {comment.accounts.avatarUrl ? (
        <Image
          source={{ uri: comment.accounts.avatarUrl }}
          className="h-32 w-32 rounded-full"
        />
      ) : (
        <View className="h-32 w-32 items-center justify-center rounded-full bg-background-secondary">
          <Text variant="caption1" className="font-bold text-text-primary">
            {comment.accounts.firstName?.[0] ?? "?"}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-5">
        <View className="self-start rounded-16 bg-background-card-highlight px-12 py-8">
          <View className="flex-row items-center gap-8">
            <Text
              variant="body2"
              numberOfLines={1}
              className="font-semibold"
            >
              {comment.accounts.firstName} {comment.accounts.lastName}
            </Text>
          </View>
          <Text variant="body2" className="mt-2 leading-5">
            {comment.content}
          </Text>
        </View>

        <View className="flex-row items-center gap-12 px-4">
          <Text variant="caption1" color="tertiary">
            {comment.createdAt ? date(comment.createdAt).fromNow() : "Recently"}
          </Text>
          {!!comment.replyCount && (
            <Text variant="caption1" color="tertiary">
              {comment.replyCount} replies
            </Text>
          )}
          {canDelete && (
            <TouchableOpacity
              accessibilityLabel="Delete comment"
              accessibilityRole="button"
              activeOpacity={0.82}
              disabled={disabled}
              onPress={handleDelete}
            >
              <Trash size={14} className="text-icon-negative" weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentEmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View className="gap-12 py-8">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-76 rounded-16" />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.emptyState} className="items-center justify-center gap-10 px-24">
      <View className="h-52 w-52 items-center justify-center rounded-full bg-background-card">
        <CommentIcon size={26} className="text-icon-secondary" />
      </View>
      <Text variant="heading" className="text-center font-medium">
        No comments yet
      </Text>
      <Text variant="body2" color="tertiary" className="text-center">
        Be the first to start the conversation.
      </Text>
    </View>
  );
};

const CommentErrorState = () => (
  <View className="flex-1 items-center justify-center gap-10 px-24">
    <CommentIcon size={32} className="text-icon-secondary" />
    <Text variant="heading" className="text-center font-medium">
      Comments unavailable
    </Text>
    <Text variant="body2" color="tertiary" className="text-center">
      We could not load comments for this photo right now.
    </Text>
  </View>
);

const CommentSeparator = () => <View className="h-14" />;

const styles = StyleSheet.create({
  commentsFrame: {
    flex: 1,
    minHeight: 0,
  },
  commentsContent: {
    paddingBottom: 104,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sheetContent: {
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    minHeight: 360,
  },
});
