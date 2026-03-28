import { BudgetCategoryForm } from "@/components/BudgetCategoryForm";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Heading } from "@/components/ui/Typography";
import {
  BUDGET_CATEGORY_KEY,
  BUDGET_STATISTIC_KEY,
} from "@/constants/query-keys";
import { IBudgetCategoryForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetCategory } from "@/interfaces";
import {
  createBudgetCategoryMutation,
  getBudgetCategoryQuery,
  updateBudgetCategoryMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { CategoryItem } from "./CategoryItem";

const AddIcon = withIconClassName(PlusIcon);

export const BudgetCategoriesScreen = () => {
  const [openCategoryForm, setOpenCategoryForm] = useState(false);
  const [selectItem, setSelectItem] = useState<IBudgetCategory>();

  const navigation = useNavigation();

  const queryClient = useQueryClient();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={() => setOpenCategoryForm(true)}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const { data: categories, isLoading } = useQuery({
    queryKey: BUDGET_CATEGORY_KEY.list({ limit: 20 }),
    queryFn: () => getBudgetCategoryQuery({ limit: 20 }),
  });

  const { mutateAsync: createCategory, isPending: isCategoryCreating } =
    useMutation({
      mutationFn: createBudgetCategoryMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_CATEGORY_KEY.lists(),
        });
        setOpenCategoryForm(false);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

  const { mutateAsync: updateCategory, isPending: isCategoryUpdating } =
    useMutation({
      mutationFn: updateBudgetCategoryMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_CATEGORY_KEY.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: BUDGET_STATISTIC_KEY.details(),
        });
        setOpenCategoryForm(false);
        setSelectItem(undefined);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

  const handleSubmitCategory = async (data: IBudgetCategoryForm) => {
    if (selectItem) {
      updateCategory({
        ...data,
        id: selectItem.id,
      });
    } else {
      createCategory(data);
    }
  };

  return (
    <ScreenContainer>
      <FlatList
        keyExtractor={(i) => i.id}
        className="mt-16"
        contentContainerClassName="gap-16"
        data={categories?.data ?? []}
        renderItem={({ item }) => (
          <CategoryItem data={item} onEdit={setSelectItem} />
        )}
        ListEmptyComponent={() => {
          if (isLoading) {
            return (
              <View className="gap-16">
                <Skeleton
                  className="h-60"
                  backgroundClassName="bg-background-primary"
                />
                <Skeleton
                  className="h-60"
                  backgroundClassName="bg-background-primary"
                />
                <Skeleton
                  className="h-60"
                  backgroundClassName="bg-background-primary"
                />
              </View>
            );
          }
          return (
            <View className="gap-16 items-center mt-40">
              <Heading variant="h6">No category added yet</Heading>
              <Button variant="outline">Add new category</Button>
            </View>
          );
        }}
      />

      <BottomSheet
        visible={openCategoryForm || !!selectItem}
        onDismiss={() => {
          setOpenCategoryForm(false);
          setSelectItem(undefined);
        }}
      >
        <BudgetCategoryForm
          onSubmit={handleSubmitCategory}
          submitting={isCategoryCreating || isCategoryUpdating}
          {...(selectItem && {
            defaultValues: {
              color: selectItem.color,
              emoji: selectItem.emoji,
              name: selectItem.name,
            },
          })}
        />
      </BottomSheet>
    </ScreenContainer>
  );
};
