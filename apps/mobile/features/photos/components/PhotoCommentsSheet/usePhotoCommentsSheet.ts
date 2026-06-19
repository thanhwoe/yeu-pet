import { Toast } from "@/components/Toast";
import { PHOTO_COMMENTS_KEY, PHOTOS_KEY } from "@/constants/query-keys";
import { IPhoto, IPhotoComment, IPhotoCommentDeleteResult } from "@/interfaces";
import {
  createPhotoCommentMutation,
  createPhotoReplyMutation,
  deletePhotoCommentMutation,
  getPhotoCommentsQuery,
} from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import {
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  appendCommentToInfiniteData,
  CommentsInfiniteData,
  getErrorMessage,
  getReplyParentId,
  LIMIT,
  MutationError,
  removeCommentFromInfiniteData,
  replaceCommentInInfiniteData,
} from "./utils";

interface UsePhotoCommentsSheetParams {
  visible: boolean;
  photoId: string;
  photoOwnerId: string;
  onDismiss: () => void;
  onCommentCountChange?: (count: number) => void;
}

export const usePhotoCommentsSheet = ({
  visible,
  photoId,
  photoOwnerId,
  onDismiss,
  onCommentCountChange,
}: UsePhotoCommentsSheetParams) => {
  const [replyingTo, setReplyingTo] = useState<IPhotoComment | null>(null);
  const [actionComment, setActionComment] = useState<IPhotoComment | null>(
    null,
  );
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [replyFocusKey, setReplyFocusKey] = useState(0);
  const { user } = useUserInfoStore();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
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
      queryClient.setQueryData<IPhoto>(
        PHOTOS_KEY.detail(photoId),
        (current) => {
          if (!current) {
            return current;
          }

          const nextPhoto = updater(current);
          notifyCommentCount(nextPhoto);
          return nextPhoto;
        },
      );
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

            return removeCommentFromInfiniteData(current, deletedCommentId);
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
                          result.replyCount ?? Math.max(0, item.replyCount - 1),
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

            return removeCommentFromInfiniteData(current, deletedCommentId);
          },
        );
        queryClient.removeQueries({
          queryKey: PHOTO_COMMENTS_KEY.replies(deletedCommentId),
        });
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
    [
      commentsQueryKey,
      notifyCommentCount,
      queryClient,
      updatePhotoCounterCache,
    ],
  );

  const { mutateAsync: createComment, isPending: isCreating } = useMutation({
    mutationFn: createPhotoCommentMutation,
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to send comment"),
      });
    },
  });

  const { mutateAsync: createReply, isPending: isCreatingReply } = useMutation({
    mutationFn: createPhotoReplyMutation,
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to send reply"),
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

          return appendCommentToInfiniteData(current, comment);
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
        (current) =>
          replaceCommentInInfiniteData(current, optimisticId, comment),
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
        (current) => removeCommentFromInfiniteData(current, comment.id),
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
      const replyTarget = replyingTo;
      const parentId = getReplyParentId(replyTarget);
      const optimisticComment = buildOptimisticComment(
        trimmedContent,
        parentId,
      );

      insertOptimisticComment(optimisticComment);
      setReplyingTo(null);

      try {
        const createdComment = parentId
          ? await createReply({
              photoId,
              commentId: parentId,
              content: trimmedContent,
            })
          : await createComment({
              photoId,
              content: trimmedContent,
            });

        replaceOptimisticComment(optimisticComment.id, createdComment);
        queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.detail(photoId) });
        queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      } catch {
        removeOptimisticComment(optimisticComment);
        setReplyingTo(replyTarget);
        throw new Error("Failed to send comment");
      }
    },
    [
      buildOptimisticComment,
      createComment,
      createReply,
      insertOptimisticComment,
      photoId,
      queryClient,
      removeOptimisticComment,
      replaceOptimisticComment,
      replyingTo,
    ],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleReply = useCallback((comment: IPhotoComment) => {
    setReplyingTo(comment);
    setReplyFocusKey((current) => current + 1);
  }, []);

  const handleToggleReplies = useCallback((commentId: string) => {
    setExpandedReplyIds((current) => {
      const next = new Set(current);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  }, []);

  const listExtraData = useMemo(
    () => ({
      activeCommentId: actionComment?.id,
      expandedReplyIds,
      isDeleting,
    }),
    [actionComment?.id, expandedReplyIds, isDeleting],
  );

  const canDeleteActionComment =
    !!actionComment &&
    (user?.id === actionComment.accountId || user?.id === photoOwnerId);

  const handleDeleteActionComment = useCallback(() => {
    if (!actionComment) {
      return;
    }

    deleteComment({ photoId, commentId: actionComment.id });
  }, [actionComment, deleteComment, photoId]);

  const handleCommentActionDismiss = useCallback(() => {
    setActionComment(null);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDismiss = useCallback(() => {
    setReplyingTo(null);
    setActionComment(null);
    onDismiss();
  }, [onDismiss]);

  return {
    actionComment,
    canDeleteActionComment,
    comments,
    currentUserId: user?.id,
    error,
    expandedReplyIds,
    handleCancelReply,
    handleCommentActionDismiss,
    handleCommentLongPress: setActionComment,
    handleDeleteActionComment,
    handleDismiss,
    handleEndReached,
    handleReply,
    handleSubmit,
    handleToggleReplies,
    isCreating: isCreating || isCreatingReply,
    isDeleting,
    isFetching,
    isFetchingNextPage,
    isLoading,
    listExtraData,
    replyingTo,
    replyFocusKey,
  };
};
