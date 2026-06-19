import { Skeleton } from "@/components/Skeleton";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { PHOTO_COMMENTS_KEY } from "@/constants/query-keys";
import { IPhotoComment } from "@/interfaces";
import { getPhotoCommentRepliesQuery } from "@/services";
import { cn, date } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { isOptimisticComment, LIMIT } from "./utils";

const noop = () => undefined;

interface PhotoCommentItemProps {
  comment: IPhotoComment;
  currentUserId?: string;
  expandedReplyIds: Set<string>;
  photoOwnerId: string;
  photoId: string;
  disabled: boolean;
  activeCommentId?: string;
  onLongPress: (comment: IPhotoComment) => void;
  onReply: (comment: IPhotoComment) => void;
  onToggleReplies: (commentId: string) => void;
}

export const PhotoCommentItem = ({
  comment,
  currentUserId,
  expandedReplyIds,
  photoOwnerId,
  photoId,
  disabled,
  activeCommentId,
  onLongPress,
  onReply,
  onToggleReplies,
}: PhotoCommentItemProps) => {
  const canDelete =
    currentUserId === comment.accountId || currentUserId === photoOwnerId;
  const isRepliesExpanded = expandedReplyIds.has(comment.id);
  const canOpenActions =
    canDelete && !disabled && !isOptimisticComment(comment.id);
  const isActive = activeCommentId === comment.id;

  const handleLongPress = useCallback(() => {
    if (canOpenActions) {
      onLongPress(comment);
    }
  }, [canOpenActions, comment, onLongPress]);

  return (
    <View className="gap-10">
      <View className="flex-row gap-10">
        <CommentAvatar comment={comment} size="parent" />

        <View className="flex-1 gap-5">
          <Pressable
            accessibilityHint={
              canOpenActions ? "Long press to open comment actions." : undefined
            }
            accessibilityLabel="Comment"
            accessibilityRole={canOpenActions ? "button" : undefined}
            delayLongPress={260}
            hitSlop={8}
            onLongPress={handleLongPress}
            onPress={noop}
          >
            {({ pressed }) => (
              <View
                className={cn(
                  "px-12 pb-8",
                  (pressed || isActive) && "bg-background-card-highlight",
                  isOptimisticComment(comment.id) && "opacity-70",
                )}
              >
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
            )}
          </Pressable>

          <View className="flex-row flex-wrap items-center gap-x-10 gap-y-4 px-4">
            <Text variant="caption1" className="text-text-subtle">
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
                <Text variant="caption1" className="text-text-muted">
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
                <Text variant="caption1" className="text-text-muted">
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
          activeCommentId={activeCommentId}
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
  activeCommentId,
  photoId,
  photoOwnerId,
  onLongPress,
  onReply,
}: {
  commentId: string;
  currentUserId?: string;
  disabled: boolean;
  activeCommentId?: string;
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
      <View className="ml-42 border-l border-line-subtle pl-12">
        {[0, 1].map((item) => (
          <Skeleton key={item} className="mb-8 h-54 rounded-14" />
        ))}
      </View>
    );
  }

  return (
    <View className="ml-12 gap-10 border-l border-line-subtle pl-12">
      {replies.map((reply) => (
        <PhotoReplyItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          disabled={disabled}
          activeCommentId={activeCommentId}
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
          className="self-start px-2 py-2"
          disabled={isFetchingNextPage}
          onPress={handleFetchMore}
        >
          <Text variant="caption1" className="font-medium text-text-muted">
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
  activeCommentId,
  photoOwnerId,
  onLongPress,
  onReply,
}: {
  comment: IPhotoComment;
  currentUserId?: string;
  disabled: boolean;
  activeCommentId?: string;
  photoOwnerId: string;
  onLongPress: (comment: IPhotoComment) => void;
  onReply: (comment: IPhotoComment) => void;
}) => {
  const canDelete =
    currentUserId === comment.accountId || currentUserId === photoOwnerId;
  const canOpenActions =
    canDelete && !disabled && !isOptimisticComment(comment.id);
  const isActive = activeCommentId === comment.id;

  const handleLongPress = useCallback(() => {
    if (canOpenActions) {
      onLongPress(comment);
    }
  }, [canOpenActions, comment, onLongPress]);

  return (
    <View className="flex-row gap-8">
      <CommentAvatar comment={comment} size="reply" />

      <View className="flex-1 gap-4">
        <Pressable
          accessibilityHint={
            canOpenActions ? "Long press to open reply actions." : undefined
          }
          accessibilityLabel="Reply"
          accessibilityRole={canOpenActions ? "button" : undefined}
          delayLongPress={260}
          hitSlop={8}
          onLongPress={handleLongPress}
          onPress={noop}
        >
          {({ pressed }) => (
            <View
              className={cn(
                "gap-4 px-10 py-6",
                (pressed || isActive) && "bg-background-card-highlight",
                isOptimisticComment(comment.id) && "opacity-70",
              )}
            >
              <View className="flex-row items-center gap-6">
                <Text
                  variant="caption1"
                  numberOfLines={1}
                  className="font-semibold"
                >
                  {comment.accounts.firstName} {comment.accounts.lastName}
                </Text>
              </View>
              <Text variant="caption1" className="mt-1 leading-5">
                {comment.content}
              </Text>
            </View>
          )}
        </Pressable>
        <View className="flex-row items-center gap-10 px-4">
          <Text variant="caption1" className="text-text-subtle">
            {comment.createdAt ? date(comment.createdAt).fromNow() : "Recently"}
          </Text>
          {!isOptimisticComment(comment.id) && (
            <TouchableOpacity
              accessibilityLabel="Reply to comment"
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() => onReply(comment)}
            >
              <Text variant="caption1" className="text-text-muted">
                Reply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentAvatar = ({
  comment,
  size,
}: {
  comment: IPhotoComment;
  size: "parent" | "reply";
}) => {
  const dimensionClassName =
    size === "parent" ? "h-32 w-32" : "h-26 w-26";
  const textVariant = size === "parent" ? "caption1" : "caption2";

  if (comment.accounts.avatarUrl) {
    return (
      <Image
        source={{ uri: comment.accounts.avatarUrl }}
        className={cn(dimensionClassName, "rounded-full")}
      />
    );
  }

  return (
    <View
      className={cn(
        dimensionClassName,
        "items-center justify-center rounded-full bg-background-secondary",
      )}
    >
      <Text variant={textVariant} className="font-bold text-text-primary">
        {comment.accounts.firstName?.[0] ?? "?"}
      </Text>
    </View>
  );
};

export const CommentSeparator = () => <View className="h-14" />;
