import { Toast } from "@/components/Toast";
import {
  BUDGET_CATEGORY_KEY,
  BUDGET_STATISTIC_KEY,
} from "@/constants/query-keys";
import { IBudgetCategoryForm } from "@/constants/validation";
import { IBudgetCategory } from "@/interfaces";
import {
  createBudgetCategoryMutation,
  getBudgetCategoryQuery,
  updateBudgetCategoryMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const CATEGORY_LIMIT = 20;

export const useBudgetCategories = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IBudgetCategory>();

  const categoriesQuery = useQuery({
    queryKey: BUDGET_CATEGORY_KEY.list({ limit: CATEGORY_LIMIT }),
    queryFn: () => getBudgetCategoryQuery({ limit: CATEGORY_LIMIT }),
  });

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

  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: BUDGET_CATEGORY_KEY.lists(),
    });
  }, [queryClient]);

  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: createBudgetCategoryMutation,
    onSuccess: () => {
      invalidateCategories();
      closeForm();
    },
    onError: (e) => {
      Toast.error({ text: e.message });
    },
  });

  const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: updateBudgetCategoryMutation,
    onSuccess: () => {
      invalidateCategories();
      queryClient.invalidateQueries({
        queryKey: BUDGET_STATISTIC_KEY.details(),
      });
      closeForm();
    },
    onError: (e) => {
      Toast.error({ text: e.message });
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

  return {
    categories: categoriesQuery.data?.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isSubmitting: isCreating || isUpdating,
    isFormOpen,
    defaultValues,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
  };
};
