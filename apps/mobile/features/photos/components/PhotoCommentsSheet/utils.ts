import { IPagination, IPhotoComment } from "@/interfaces";
import { InfiniteData } from "@tanstack/react-query";

export const LIMIT = 20;

export type CommentsInfiniteData = InfiniteData<IPagination<IPhotoComment>>;

export type MutationError = {
  errors?: {
    message: string;
  }[];
  message?: string;
};

export const getErrorMessage = (error: MutationError, fallback: string) =>
  error.errors?.[0]?.message ?? error.message ?? fallback;

export const isOptimisticComment = (id: string) =>
  id.startsWith("optimistic-");

export const getReplyParentId = (comment: IPhotoComment | null) => {
  if (!comment) {
    return undefined;
  }

  return comment.parentId ?? comment.id;
};

export const appendCommentToInfiniteData = (
  current: CommentsInfiniteData,
  comment: IPhotoComment,
) => {
  if (!current.pages.length) {
    return {
      ...current,
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

  let removedDuplicate = false;
  const pagesWithoutDuplicate = current.pages.map((page) => ({
    ...page,
    data: page.data.filter((item) => {
      if (item.id !== comment.id) {
        return true;
      }

      removedDuplicate = true;
      return false;
    }),
  }));
  const lastPageIndex = Math.max(0, pagesWithoutDuplicate.length - 1);
  const totalDelta = removedDuplicate ? 0 : 1;

  return {
    ...current,
    pages: pagesWithoutDuplicate.map((page, index) => ({
      ...page,
      data: index === lastPageIndex ? [...page.data, comment] : page.data,
      meta: {
        ...page.meta,
        total: page.meta.total + totalDelta,
      },
    })),
  };
};

export const removeCommentFromInfiniteData = (
  current: CommentsInfiniteData,
  commentId: string,
) => {
  let removed = false;

  const pages = current.pages.map((page) => {
    const data = page.data.filter((item) => item.id !== commentId);

    if (data.length === page.data.length) {
      return page;
    }

    removed = true;
    return {
      ...page,
      data,
    };
  });

  if (!removed) {
    return current;
  }

  return {
    ...current,
    pages: pages.map((page) => ({
      ...page,
      meta: {
        ...page.meta,
        total: Math.max(0, page.meta.total - 1),
      },
    })),
  };
};

export const replaceCommentInInfiniteData = (
  current: CommentsInfiniteData,
  optimisticId: string,
  comment: IPhotoComment,
) => {
  let replaced = false;

  const pages = current.pages.map((page) => ({
    ...page,
    data: page.data.map((item) => {
      if (item.id !== optimisticId) {
        return item;
      }

      replaced = true;
      return comment;
    }),
  }));

  if (replaced) {
    return {
      ...current,
      pages,
    };
  }

  return appendCommentToInfiniteData(current, comment);
};
