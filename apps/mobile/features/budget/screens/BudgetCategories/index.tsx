import { Popup } from "@/components/Popup";
import { Skeleton } from "@/components/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { BudgetCategoryForm } from "@/features/budget/components/BudgetCategoryForm";
import { useBudgetCategories } from "@/features/budget/useBudgetCategories";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useNavigation } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useEffect } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { CategoryItem } from "./CategoryItem";

const AddIcon = withIconClassName(PlusIcon);

export const BudgetCategoriesScreen = () => {
  const navigation = useNavigation();
  const {
    categories,
    isLoading,
    isRefreshing,
    isSubmitting,
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
    refetch,
  } = useBudgetCategories();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          accessibilityLabel="Add budget category"
          accessibilityRole="button"
          onPress={openCreateForm}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, openCreateForm]);

  return (
    <ScreenContainer>
      <FlatList
        keyExtractor={(i) => i.id}
        className="mt-16"
        contentContainerClassName="gap-16"
        data={categories}
        refreshing={isRefreshing}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <CategoryItem
            data={item}
            onEdit={openEditForm}
            onDelete={openDeleteConfirm}
          />
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
            <StateView
              variant="empty"
              title="No category added yet"
              description="Create categories to understand where your pet budget goes."
              actionLabel="Add new category"
              onAction={openCreateForm}
              className="mt-40"
            />
          );
        }}
      />

      <BottomSheet visible={isFormOpen} onDismiss={closeForm}>
        <BudgetCategoryForm
          onSubmit={handleSubmit}
          submitting={isSubmitting}
          defaultValues={defaultValues}
        />
      </BottomSheet>

      <Popup
        visible={!!categoryDelete}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Remove Category"
        description={
          categoryDelete
            ? `Remove ${categoryDelete.name} from your budget categories?`
            : undefined
        }
        variant="delete"
        loading={isDeleting}
      />
    </ScreenContainer>
  );
};
