import { Toast } from "@/components/Toast";
import {
  BUDGET_KEY,
  BUDGET_CATEGORY_KEY,
  BUDGET_STATISTIC_KEY,
  BUDGET_TRANSACTION_KEY,
} from "@/constants/query-keys";
import { IBudgetCategoryForm } from "@/constants/validation";
import { IBudgetCategory } from "@/interfaces";
import {
  createBudgetCategoryMutation,
  deleteBudgetCategoryMutation,
  getBudgetCategoryQuery,
  updateBudgetCategoryMutation,
} from "@/services";
import { getApiErrorToast } from "@/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const CATEGORY_LIMIT = 20;

export const useBudgetCategories = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IBudgetCategory>();
  const [categoryDelete, setCategoryDelete] = useState<IBudgetCategory>();

  const categoriesQuery = useInfiniteQuery({
    queryKey: BUDGET_CATEGORY_KEY.list({ limit: CATEGORY_LIMIT }),
    queryFn: ({ pageParam }) =>
      getBudgetCategoryQuery({ limit: CATEGORY_LIMIT, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasNextPage) return undefined;
      return (lastPage.meta.page ?? 1) + 1;
    },
  });

  const categories = useMemo(
    () =>
      categoriesQuery.data?.pages.flatMap((page) =>
        Array.isArray(page.data) ? page.data : [],
      ) ?? [],
    [categoriesQuery.data?.pages],
  );

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
  }, []);

  const openCreateForm = useCallback(() => {
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((category: IBudgetCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }, []);

  const openDeleteConfirm = useCallback((category: IBudgetCategory) => {
    setCategoryDelete(category);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setCategoryDelete(undefined);
  }, []);

  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: BUDGET_CATEGORY_KEY.lists(),
    });
  }, [queryClient]);

  const invalidateBudgetData = useCallback(() => {
    invalidateCategories();
    queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
    queryClient.invalidateQueries({ queryKey: BUDGET_STATISTIC_KEY.details() });
    queryClient.invalidateQueries({
      queryKey: BUDGET_TRANSACTION_KEY.lists(),
    });
  }, [invalidateCategories, queryClient]);

  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: createBudgetCategoryMutation,
    onSuccess: () => {
      invalidateCategories();
      closeForm();
    },
    onError: (e) => {
      Toast.error(
        getApiErrorToast(e, {
          titleKey: "budget.toast.categoryCreateErrorTitle",
          textKey: "budget.toast.categoryCreateErrorText",
        }),
      );
    },
  });

  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: updateBudgetCategoryMutation,
    onSuccess: () => {
      invalidateBudgetData();
      closeForm();
    },
    onError: (e) => {
      Toast.error(
        getApiErrorToast(e, {
          titleKey: "budget.toast.categoryUpdateErrorTitle",
          textKey: "budget.toast.categoryUpdateErrorText",
        }),
      );
    },
  });

  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: deleteBudgetCategoryMutation,
    onSuccess: () => {
      invalidateBudgetData();
    },
    onError: (e) => {
      Toast.error(
        getApiErrorToast(e, {
          titleKey: "budget.toast.categoryDeleteErrorTitle",
          textKey: "budget.toast.categoryDeleteErrorText",
        }),
      );
    },
    onSettled: () => {
      closeDeleteConfirm();
    },
  });

  const handleSubmit = useCallback(
    async (data: IBudgetCategoryForm) => {
      if (selectedCategory) {
        await updateCategory({
          ...data,
          id: selectedCategory.id,
        });
        return;
      }

      await createCategory(data);
    },
    [createCategory, selectedCategory, updateCategory],
  );

  const defaultValues = useMemo(() => {
    if (!selectedCategory) {
      return undefined;
    }

    return {
      color: selectedCategory.color,
      emoji: selectedCategory.emoji,
      name: selectedCategory.name,
    };
  }, [selectedCategory]);

  const handleDelete = useCallback(() => {
    if (!categoryDelete) return;
    deleteCategory(categoryDelete.id);
  }, [categoryDelete, deleteCategory]);

  const loadMoreCategories = useCallback(() => {
    if (
      categoriesQuery.isLoading ||
      categoriesQuery.isFetchingNextPage ||
      !categoriesQuery.hasNextPage ||
      !categories.length
    ) {
      return;
    }

    void categoriesQuery.fetchNextPage();
  }, [
    categories.length,
    categoriesQuery.fetchNextPage,
    categoriesQuery.hasNextPage,
    categoriesQuery.isFetchingNextPage,
    categoriesQuery.isLoading,
  ]);

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    isRefreshing:
      categoriesQuery.isRefetching &&
      !categoriesQuery.isLoading &&
      !categoriesQuery.isFetchingNextPage,
    isFetchingNextPage: categoriesQuery.isFetchingNextPage,
    hasNextPage: categoriesQuery.hasNextPage,
    isSubmitting: isCreating || isUpdating,
    isDeleting,
    isFormOpen,
    categoryDelete,
    defaultValues,
    openCreateForm,
    openEditForm,
    openDeleteConfirm,
    closeDeleteConfirm,
    closeForm,
    handleSubmit,
    handleDelete,
    loadMoreCategories,
    refetch: categoriesQuery.refetch,
  };
};
