import { Popup } from "@/components/Popup";
import { RefreshControl } from "@/components/RefreshControl";
import { Skeleton } from "@/components/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import { MedicalRecordListItem } from "@/features/medical-records/components/MedicalRecordListItem";
import { useMedicalRecordPetList } from "@/features/medical-records/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { TrashIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItem, View } from "react-native";

const DeleteIcon = withIconClassName(TrashIcon);

export const MedicalRecordListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName?: string;
  }>();
  const {
    hasNextPage,
    isDeletingMedicalRecord,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    openDeletePopup,
    records,
    selectedRecord,
    fetchNextPage,
    handleCloseDeletePopup,
    handleCloseRecordOptions,
    handleDelete,
    handleOpenDeletePopup,
    handleSelectRecord,
    refetch,
  } = useMedicalRecordPetList(petId);

  useEffect(() => {
    if (!petName) return;

    navigation.setOptions({
      title: t("medicalRecords.list.petRecordsTitle", { petName }),
    });
  }, [navigation, petName, t]);

  const keyExtractor = useCallback((item: IMedicalRecord) => item.id, []);

  const renderItem = useCallback<ListRenderItem<IMedicalRecord>>(
    ({ item }) => (
      <MedicalRecordListItem
        record={item}
        onPress={() => {
          router.push({
            pathname: "/medical-record/[id]",
            params: { id: item.id },
          });
        }}
        onMorePress={() => handleSelectRecord(item)}
      />
    ),
    [handleSelectRecord, router],
  );

  const listEmptyComponent = useMemo(
    () =>
      isLoading ? (
        <View className="gap-12">
          <Skeleton
            className="h-80"
            backgroundClassName="bg-background-primary"
          />
          <Skeleton
            className="h-80"
            backgroundClassName="bg-background-primary"
          />
          <Skeleton
            className="h-80"
            backgroundClassName="bg-background-primary"
          />
        </View>
      ) : (
        <Body center>{t("medicalRecords.list.empty")}</Body>
      ),
    [isLoading, t],
  );

  const listFooterComponent = useMemo(
    () => (isFetchingNextPage ? <Spinner /> : null),
    [isFetchingNextPage],
  );

  const handleEndReached = useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (!records.length) return;
    fetchNextPage();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    records.length,
  ]);

  const optionsData = useMemo(
    () => [
      {
        label: t("medicalRecords.actions.delete"),
        value: selectedRecord,
        onPress: handleOpenDeletePopup,
        icon: (
          <DeleteIcon
            size={24}
            weight="fill"
            className="text-icon-negative"
          />
        ),
      },
    ],
    [handleOpenDeletePopup, selectedRecord, t],
  );

  return (
    <ScreenContainer className="px-0">
      <FlatList
        data={records}
        keyExtractor={keyExtractor}
        contentContainerClassName="px-20 pt-20 pb-safe gap-12"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colorClassName="text-text-primary"
          />
        }
        renderItem={renderItem}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
      />

      <BottomSheet
        visible={!!selectedRecord}
        onDismiss={handleCloseRecordOptions}
      >
        <Options data={optionsData} />
      </BottomSheet>
      <Popup
        visible={openDeletePopup}
        onCancel={handleCloseDeletePopup}
        onConfirm={handleDelete}
        title={t("medicalRecords.list.popupTitle")}
        description={t("medicalRecords.list.popupDescription")}
        variant="delete"
        loading={isDeletingMedicalRecord}
      />
    </ScreenContainer>
  );
};
