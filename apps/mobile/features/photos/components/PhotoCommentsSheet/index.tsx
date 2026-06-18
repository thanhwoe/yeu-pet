import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { PHOTO_COMMENTS_KEY, PHOTOS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  IPagination,
  IPhoto,
  IPhotoComment,
  IPhotoCommentDeleteResult,
} from "@/interfaces";
import {
  createPhotoCommentMutation,
  deletePhotoCommentMutation,
  getPhotoCommentRepliesQuery,
  getPhotoCommentsQuery,
} from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { cn, date } from "@/utils";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChatCircleTextIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
  XIcon,
} from "phosphor-react-native";
import { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const LIMIT = 20;
const COMMENTS_SHEET_SNAP_POINT = "76%";

const CommentIcon = withIconClassName(ChatCircleTextIcon);
const SendIcon = withIconClassName(PaperPlaneTiltIcon);
const Trash = withIconClassName(TrashIcon);
const CloseIcon = withIconClassName(XIcon);

type CommentsInfiniteData = InfiniteData<IPagination<IPhotoComment>>;

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
  onCommentCountChange?: (count: number) => void;
}

const getErrorMessage = (error: MutationError, fallback: string) =>
  error.errors?.[0]?.message ?? error.message ?? fallback;

const isOptimisticComment = (id: string) => id.startsWith("optimistic-");

export const PhotoCommentsSheet = ({
  visible,
  photoId,
  photoOwnerId,
  onDismiss,
  onCommentCountChange,
}: PhotoCommentsSheetProps) => {
  const [replyingTo, setReplyingTo] = useState<IPhotoComment | null>(null);
  const [actionComment, setActionComment] = useState<IPhotoComment | null>(
    null,
  );
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(
    () => new Set(),
  );
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
    queryClient.invalidateQueries({ queryKey: PHOTO_COMMENTS_KEY.all });
    queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(photoId) });
    queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
  }, [photoId, queryClient]);

  const notifyCommentCount = useCallback(
    (photo: IPhoto) => {
      const count = photo.comments ?? photo.commentCount;

      if (typeof count === "number") {
        onCommentCountChange?.(count);
      }
    },
    [onCommentCountChange],
  );

  const updatePhotoCounterCache = useCallback(
    (updater: (photo: IPhoto) => IPhoto) => {
      queryClient.setQueryData<IPhoto>(PHOTOS_KEY.detail(photoId), (current) => {
        if (!current) {
          return current;
        }

        const nextPhoto = updater(current);
        notifyCommentCount(nextPhoto);
        return nextPhoto;
      });
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
    },
    [notifyCommentCount, photoId, queryClient],
  );

  const applyDeletedCommentResult = useCallback(
    (result: IPhotoCommentDeleteResult) => {
      const deletedComment = result.comment;
      const deletedCommentId = deletedComment.id;

      if (deletedComment.parentId) {
        const repliesQueryKey = PHOTO_COMMENTS_KEY.replies(
          deletedComment.parentId,
        );

        queryClient.setQueryData<CommentsInfiniteData>(
          repliesQueryKey,
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                data: page.data.filter((item) => item.id !== deletedCommentId),
                meta: {
                  ...page.meta,
                  total: Math.max(0, page.meta.total - 1),
                },
              })),
            };
          },
        );

        queryClient.setQueryData<CommentsInfiniteData>(
          commentsQueryKey,
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                data: page.data.map((item) =>
                  item.id === deletedComment.parentId
                    ? {
                        ...item,
                        replyCount:
                          result.replyCount ??
                          Math.max(0, item.replyCount - 1),
                      }
                    : item,
                ),
              })),
            };
          },
        );
      } else {
        queryClient.setQueryData<CommentsInfiniteData>(
          commentsQueryKey,
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                data: page.data.filter((item) => item.id !== deletedCommentId),
                meta: {
                  ...page.meta,
                  total: Math.max(0, page.meta.total - 1),
                },
              })),
            };
          },
        );
      }

      setExpandedReplyIds((current) => {
        if (!current.has(deletedCommentId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(deletedCommentId);
        return next;
      });

      updatePhotoCounterCache((current) => ({
        ...current,
        commentCount: result.photo.commentCount ?? result.photo.comments,
        comments: result.photo.comments ?? result.photo.commentCount,
      }));
      notifyCommentCount(result.photo);
    },
    [commentsQueryKey, notifyCommentCount, queryClient, updatePhotoCounterCache],
  );

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    mutationFn: createPhotoCommentMutation,
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to send comment"),
      });
    },
  });

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: deletePhotoCommentMutation,
    onSuccess(result) {
      Toast.success({ text: "Comment deleted." });
      setActionComment(null);
      applyDeletedCommentResult(result);
      invalidateComments();
    },
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to delete comment"),
      });
    },
  });

  const buildOptimisticComment = useCallback(
    (content: string, parentId?: string): IPhotoComment => ({
      id: `optimistic-${Date.now()}`,
      accountId: user?.id ?? "",
      photoId,
      parentId: parentId ?? null,
      content,
      deletedAt: null,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accounts: {
        id: user?.id ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        avatarUrl: user?.avatarUrl ?? null,
      },
    }),
    [photoId, user],
  );

  const updateCommentsCache = useCallback(
    (
      updater: (data: CommentsInfiniteData) => CommentsInfiniteData,
      queryKey: QueryKey = commentsQueryKey,
    ) => {
      queryClient.setQueryData<CommentsInfiniteData>(queryKey, (current) => {
        if (!current) {
          return current;
        }

        return updater(current);
      });
    },
    [commentsQueryKey, queryClient],
  );

  const insertOptimisticComment = useCallback(
    (comment: IPhotoComment) => {
      const targetQueryKey = comment.parentId
        ? PHOTO_COMMENTS_KEY.replies(comment.parentId)
        : commentsQueryKey;

      if (comment.parentId) {
        setExpandedReplyIds((current) => {
          const next = new Set(current);
          next.add(comment.parentId as string);
          return next;
        });
      }

      queryClient.setQueryData<CommentsInfiniteData>(
        targetQueryKey,
        (current) => {
          if (!current) {
            return {
              pageParams: [1],
              pages: [
                {
                  data: [comment],
                  meta: {
                    total: 1,
                    page: 1,
                    limit: LIMIT,
                    totalPages: 1,
                    hasPreviousPage: false,
                    hasNextPage: false,
                  },
                },
              ],
            };
          }

          const [firstPage, ...remainingPages] = current.pages;

          return {
            ...current,
            pages: [
              {
                ...firstPage,
                data: [...firstPage.data, comment],
                meta: {
                  ...firstPage.meta,
                  total: firstPage.meta.total + 1,
                },
              },
              ...remainingPages,
            ],
          };
        },
      );

      if (comment.parentId) {
        updateCommentsCache((current) => ({
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === comment.parentId
                ? { ...item, replyCount: item.replyCount + 1 }
                : item,
            ),
          })),
        }));
      }

      updatePhotoCounterCache((current) => {
        const comments = current.comments ?? current.commentCount ?? 0;

        return {
          ...current,
          commentCount: comments + 1,
          comments: comments + 1,
        };
      });
    },
    [
      commentsQueryKey,
      queryClient,
      updateCommentsCache,
      updatePhotoCounterCache,
    ],
  );

  const replaceOptimisticComment = useCallback(
    (optimisticId: string, comment: IPhotoComment) => {
      const targetQueryKey = comment.parentId
        ? PHOTO_COMMENTS_KEY.replies(comment.parentId)
        : commentsQueryKey;

      updateCommentsCache(
        (current) => ({
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === optimisticId ? comment : item,
            ),
          })),
        }),
        targetQueryKey,
      );
    },
    [commentsQueryKey, updateCommentsCache],
  );

  const removeOptimisticComment = useCallback(
    (comment: IPhotoComment) => {
      const targetQueryKey = comment.parentId
        ? PHOTO_COMMENTS_KEY.replies(comment.parentId)
        : commentsQueryKey;

      updateCommentsCache(
        (current) => ({
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== comment.id),
            meta: {
              ...page.meta,
              total: Math.max(0, page.meta.total - 1),
            },
          })),
        }),
        targetQueryKey,
      );

      if (comment.parentId) {
        updateCommentsCache((current) => ({
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === comment.parentId
                ? { ...item, replyCount: Math.max(0, item.replyCount - 1) }
                : item,
            ),
          })),
        }));
      }

      updatePhotoCounterCache((current) => {
        const comments = current.comments ?? current.commentCount ?? 0;

        return {
          ...current,
          commentCount: Math.max(0, comments - 1),
          comments: Math.max(0, comments - 1),
        };
      });
    },
    [commentsQueryKey, updateCommentsCache, updatePhotoCounterCache],
  );

  const handleSubmit = useCallback(
    async (trimmedContent: string) => {
      const parentId = replyingTo?.id;
      const optimisticComment = buildOptimisticComment(
        trimmedContent,
        parentId,
      );

      insertOptimisticComment(optimisticComment);
      setReplyingTo(null);

      try {
        const createdComment = await createComment({
          photoId,
          content: trimmedContent,
          parentId,
        });

        replaceOptimisticComment(optimisticComment.id, createdComment);
        queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(photoId) });
        queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      } catch {
        removeOptimisticComment(optimisticComment);
      }
    },
    [
      buildOptimisticComment,
      createComment,
      insertOptimisticComment,
      photoId,
      queryClient,
      removeOptimisticComment,
      replaceOptimisticComment,
      replyingTo?.id,
    ],
  );

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
        expandedReplyIds={expandedReplyIds}
        photoOwnerId={photoOwnerId}
        photoId={photoId}
        disabled={isDeleting}
        onLongPress={setActionComment}
        onReply={setReplyingTo}
        onToggleReplies={(commentId) => {
          setExpandedReplyIds((current) => {
            const next = new Set(current);

            if (next.has(commentId)) {
              next.delete(commentId);
            } else {
              next.add(commentId);
            }

            return next;
          });
        }}
      />
    ),
    [expandedReplyIds, isDeleting, photoId, photoOwnerId, user?.id],
  );

  const keyExtractor = useCallback((item: IPhotoComment) => item.id, []);
  const footer = useMemo(
    () => (
      <CommentComposer
        isCreating={isCreating}
        onSubmit={handleSubmit}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    ),
    [handleSubmit, isCreating, replyingTo],
  );
  const canDeleteActionComment =
    !!actionComment &&
    (user?.id === actionComment.accountId || user?.id === photoOwnerId);

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      titleElement={<Body weight="semiBold">Comments</Body>}
      useScrollView={false}
      enableDynamicSizing={false}
      snapPoints={[COMMENTS_SHEET_SNAP_POINT]}
      keyboardBehavior="interactive"
      footer={footer}
    >
      <View style={styles.sheetContent}>
        <View style={styles.commentsFrame}>
          {error && !comments.length ? (
            <CommentErrorState />
          ) : (
            <FlashList
              data={comments}
              extraData={expandedReplyIds}
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

      <CommentActionSheet
        visible={!!actionComment}
        canDelete={canDeleteActionComment}
        disabled={isDeleting}
        onDismiss={() => setActionComment(null)}
        onDelete={() => {
          if (!actionComment) {
            return;
          }

          deleteComment({ photoId, commentId: actionComment.id });
        }}
      />
    </BottomSheet>
  );
};

const CommentComposer = memo(
  ({
    isCreating,
    onSubmit,
    replyingTo,
    onCancelReply,
  }: {
    isCreating: boolean;
    onSubmit: (content: string) => Promise<void>;
    replyingTo: IPhotoComment | null;
    onCancelReply: () => void;
  }) => {
    const [content, setContent] = useState("");
    const isDisabled = !content.trim() || isCreating;
    const handleSubmit = useCallback(async () => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        Toast.warn({ text: "Comment is required." });
        return;
      }

      await onSubmit(trimmedContent);
      setContent("");
    }, [content, onSubmit]);

    return (
      <View className="border-t-hairline border-line-tertiary bg-background px-20 py-10">
        {replyingTo && (
          <View className="mb-8 flex-row items-center justify-between rounded-12 bg-background-card px-12 py-8">
            <Text variant="caption1" color="tertiary" numberOfLines={1}>
              Replying to {replyingTo.accounts.firstName}
            </Text>
            <TouchableOpacity
              accessibilityLabel="Cancel reply"
              accessibilityRole="button"
              activeOpacity={0.82}
              className="h-28 w-28 items-center justify-center rounded-full bg-background-secondary"
              onPress={onCancelReply}
            >
              <CloseIcon
                size={15}
                weight="bold"
                className="text-icon-primary"
              />
            </TouchableOpacity>
          </View>
        )}
        <View className="flex-row items-end gap-8 rounded-full bg-background-card-highlight px-14 py-8">
          <BottomSheetTextInput
            value={content}
            onChangeText={setContent}
            placeholder={replyingTo ? "Write a reply" : "Write a comment"}
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
            onPress={handleSubmit}
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
  },
);

CommentComposer.displayName = "CommentComposer";

const PhotoCommentItem = ({
  comment,
  currentUserId,
  expandedReplyIds,
  photoOwnerId,
  photoId,
  disabled,
  onLongPress,
  onReply,
  onToggleReplies,
}: {
  comment: IPhotoComment;
  currentUserId?: string;
  expandedReplyIds: Set<string>;
  photoOwnerId: string;
  photoId: string;
  disabled: boolean;
  onLongPress: (comment: IPhotoComment) => void;
  onReply: (comment: IPhotoComment) => void;
  onToggleReplies: (commentId: string) => void;
}) => {
  const canDelete =
    currentUserId === comment.accountId || currentUserId === photoOwnerId;
  const isRepliesExpanded = expandedReplyIds.has(comment.id);

  const handleLongPress = useCallback(() => {
    if (canDelete && !disabled && !isOptimisticComment(comment.id)) {
      onLongPress(comment);
    }
  }, [canDelete, comment, disabled, onLongPress]);

  return (
    <View className="gap-10">
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
          <TouchableOpacity
            accessibilityLabel="Comment options"
            activeOpacity={0.9}
            className={cn(
              "self-start rounded-16 bg-background-card-highlight px-12 py-8",
              isOptimisticComment(comment.id) && "opacity-70",
            )}
            delayLongPress={260}
            onLongPress={handleLongPress}
          >
            <View className="flex-row items-center gap-8">
              <Text variant="body2" numberOfLines={1} className="font-semibold">
                {comment.accounts.firstName} {comment.accounts.lastName}
              </Text>
            </View>
            <Text variant="body2" className="mt-2 leading-5">
              {comment.content}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-12 px-4">
            <Text variant="caption1" color="tertiary">
              {comment.createdAt
                ? date(comment.createdAt).fromNow()
                : "Recently"}
            </Text>
            {!isOptimisticComment(comment.id) && (
              <TouchableOpacity
                accessibilityLabel="Reply to comment"
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={() => onReply(comment)}
              >
                <Text
                  variant="caption1"
                  color="tertiary"
                  className="font-semibold"
                >
                  Reply
                </Text>
              </TouchableOpacity>
            )}
            {!!comment.replyCount && (
              <TouchableOpacity
                accessibilityLabel={
                  isRepliesExpanded ? "Hide replies" : "View replies"
                }
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={() => onToggleReplies(comment.id)}
              >
                <Text
                  variant="caption1"
                  color="tertiary"
                  className="font-semibold"
                >
                  {isRepliesExpanded ? "Hide" : "View"} {comment.replyCount}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {isRepliesExpanded && (
        <CommentReplies
          commentId={comment.id}
          currentUserId={currentUserId}
          disabled={disabled}
          photoId={photoId}
          photoOwnerId={photoOwnerId}
          onLongPress={onLongPress}
          onReply={onReply}
        />
      )}
    </View>
  );
};

const CommentReplies = ({
  commentId,
  currentUserId,
  disabled,
  photoId,
  photoOwnerId,
  onLongPress,
  onReply,
}: {
  commentId: string;
  currentUserId?: string;
  disabled: boolean;
  photoId: string;
  photoOwnerId: string;
  onLongPress: (comment: IPhotoComment) => void;
  onReply: (comment: IPhotoComment) => void;
}) => {
  const {
    data: replies = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: PHOTO_COMMENTS_KEY.replies(commentId),
    queryFn: ({ pageParam }) =>
      getPhotoCommentRepliesQuery({
        photoId,
        commentId,
        limit: LIMIT,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;

      return lastPage.meta.page + 1;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
  });

  const handleFetchMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <View className="ml-42 gap-8">
        {[0, 1].map((item) => (
          <Skeleton key={item} className="h-54 rounded-14" />
        ))}
      </View>
    );
  }

  return (
    <View className="ml-42 gap-10">
      {replies.map((reply) => (
        <PhotoReplyItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          disabled={disabled}
          photoOwnerId={photoOwnerId}
          onLongPress={onLongPress}
          onReply={onReply}
        />
      ))}
      {hasNextPage && (
        <TouchableOpacity
          accessibilityLabel="Load more replies"
          accessibilityRole="button"
          activeOpacity={0.82}
          className="self-start px-4"
          disabled={isFetchingNextPage}
          onPress={handleFetchMore}
        >
          <Text variant="caption1" color="tertiary" className="font-semibold">
            {isFetchingNextPage ? "Loading replies..." : "View more replies"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const PhotoReplyItem = ({
  comment,
  currentUserId,
  disabled,
  photoOwnerId,
  onLongPress,
  onReply,
}: {
  comment: IPhotoComment;
  currentUserId?: string;
  disabled: boolean;
  photoOwnerId: string;
  onLongPress: (comment: IPhotoComment) => void;
  onReply: (comment: IPhotoComment) => void;
}) => {
  const canDelete =
    currentUserId === comment.accountId || currentUserId === photoOwnerId;

  const handleLongPress = useCallback(() => {
    if (canDelete && !disabled && !isOptimisticComment(comment.id)) {
      onLongPress(comment);
    }
  }, [canDelete, comment, disabled, onLongPress]);

  return (
    <View className="flex-row gap-8">
      {comment.accounts.avatarUrl ? (
        <Image
          source={{ uri: comment.accounts.avatarUrl }}
          className="h-26 w-26 rounded-full"
        />
      ) : (
        <View className="h-26 w-26 items-center justify-center rounded-full bg-background-secondary">
          <Text variant="caption2" className="font-bold text-text-primary">
            {comment.accounts.firstName?.[0] ?? "?"}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-4">
        <TouchableOpacity
          accessibilityLabel="Reply options"
          activeOpacity={0.9}
          className={cn(
            "self-start rounded-14 bg-background-card px-10 py-7",
            isOptimisticComment(comment.id) && "opacity-70",
          )}
          delayLongPress={260}
          onLongPress={handleLongPress}
        >
          <Text variant="caption1" className="font-semibold">
            {comment.accounts.firstName} {comment.accounts.lastName}
          </Text>
          <Text variant="caption1" className="mt-1 leading-5">
            {comment.content}
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-10 px-4">
          <Text variant="caption1" color="tertiary">
            {comment.createdAt ? date(comment.createdAt).fromNow() : "Recently"}
          </Text>
          {!isOptimisticComment(comment.id) && (
            <TouchableOpacity
              accessibilityLabel="Reply to comment"
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() =>
                onReply({
                  ...comment,
                  id: comment.parentId ?? comment.id,
                })
              }
            >
              <Text
                variant="caption1"
                color="tertiary"
                className="font-semibold"
              >
                Reply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentActionSheet = ({
  visible,
  canDelete,
  disabled,
  onDismiss,
  onDelete,
}: {
  visible: boolean;
  canDelete: boolean;
  disabled: boolean;
  onDismiss: () => void;
  onDelete: () => void;
}) => (
  <BottomSheet
    visible={visible}
    onDismiss={onDismiss}
    titleElement={<Body weight="semiBold">Comment options</Body>}
    enableDynamicSizing
  >
    <View className="gap-8 px-20 pb-8">
      {canDelete ? (
        <TouchableOpacity
          accessibilityLabel="Delete comment"
          accessibilityRole="button"
          activeOpacity={0.82}
          className="flex-row items-center gap-12 rounded-16 bg-background-negative-foreground px-14 py-14"
          disabled={disabled}
          onPress={onDelete}
        >
          <View className="h-34 w-34 items-center justify-center rounded-full bg-background-negative">
            <Trash
              size={18}
              weight="bold"
              className="text-icon-primary-inverse"
            />
          </View>
          <View className="flex-1">
            <Text variant="body2" className="font-semibold text-text-negative">
              Delete comment
            </Text>
          </View>
          {disabled && <Spinner size={18} />}
        </TouchableOpacity>
      ) : (
        <View className="items-center gap-8 px-16 py-20">
          <CommentIcon size={28} className="text-icon-secondary" />
          <Text variant="body2" color="tertiary" className="text-center">
            No actions available for this comment.
          </Text>
        </View>
      )}
    </View>
  </BottomSheet>
);

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
    <View
      style={styles.emptyState}
      className="items-center justify-center gap-10 px-24"
    >
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
