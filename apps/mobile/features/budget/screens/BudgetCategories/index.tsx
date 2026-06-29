import { Popup } from "@/components/Popup";
import { Skeleton } from "@/components/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { StateView } from "@/components/ui/StateView";
import { BudgetCategoryForm } from "@/features/budget/components/BudgetCategoryForm";
import { useBudgetCategories } from "@/features/budget/useBudgetCategories";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useNavigation } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity, View } from "react-native";
import { CategoryItem } from "./CategoryItem";

const AddIcon = withIconClassName(PlusIcon);

export const BudgetCategoriesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    categories,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
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
    loadMoreCategories,
    refetch,
  } = useBudgetCategories();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          accessibilityLabel={t("budget.accessibility.addCategory")}
          accessibilityRole="button"
          onPress={openCreateForm}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, openCreateForm, t]);

  return (
    <ScreenContainer>
      <FlatList
        keyExtractor={(i) => i.id}
        className="mt-16"
        contentContainerClassName="gap-16"
        data={categories}
        refreshing={isRefreshing}
        onRefresh={refetch}
        onEndReached={loadMoreCategories}
        onEndReachedThreshold={0.2}
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
              title={t("budget.categories.emptyTitle")}
              description={t("budget.categories.emptyDescription")}
              actionLabel={t("budget.actions.addNewCategory")}
              onAction={openCreateForm}
              className="mt-40"
            />
          );
        }}
        ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
      />

      <BottomSheet
        visible={isFormOpen}
        onDismiss={closeForm}
        keyboardBehavior="interactive"
      >
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
        title={t("budget.categories.popupTitle")}
        description={
          categoryDelete
            ? t("budget.categories.popupDescription", {
                name: categoryDelete.name,
              })
            : undefined
        }
        variant="delete"
        loading={isDeleting}
      />
    </ScreenContainer>
  );
};
