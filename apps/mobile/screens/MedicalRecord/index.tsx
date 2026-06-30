import { Popup } from "@/components/Popup";
import { RefreshControl } from "@/components/RefreshControl";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Body } from "@/components/ui/Typography";
import { MedicalRecordContainer } from "@/features/medical-records/components/MedicalRecordContainer";
import { MedicalRecordForm } from "@/features/medical-records/components/MedicalRecordForm";
import { useMedicalRecordList } from "@/features/medical-records/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import { type Href, useIsFocused, useNavigation, useRouter } from "expo-router";
import { PlusIcon, TrashIcon } from "phosphor-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

const AddIcon = withIconClassName(PlusIcon);
const DeleteIcon = withIconClassName(TrashIcon);

export const MedicalRecordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const router = useRouter();
  const {
    isCreating,
    isDeletingMedicalRecord,
    isRefetching,
    openDeletePopup,
    openForm,
    petData,
    selectedRecord,
    handleClearSelectedRecord,
    handleCloseDeletePopup,
    handleCloseForm,
    handleCreateMedicalRecord,
    handleDelete,
    handleOpenDeletePopup,
    handleOpenForm,
    handleRefresh,
    handleSelectRecord,
  } = useMedicalRecordList();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={handleOpenForm}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [handleOpenForm, navigation]);

  const handlePress = (data: IMedicalRecord) => {
    router.push({
      pathname: "/medical-record/[id]",
      params: {
        id: data.id,
      },
    });
  };

  return (
    <>
      <ScreenContainer
        scrollEnabled
        contentContainerClassName="px-20 mt-20"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && isFocused}
            onRefresh={handleRefresh}
            colorClassName="text-text-primary"
          />
        }
      >
        {petData?.data?.map((pet) => (
          <MedicalRecordContainer
            key={pet.id}
            pet={pet}
            onRecordPress={handlePress}
            onSeeAllPress={(selectedPet) => {
              router.push(
                `/medical-record/pet/${selectedPet.id}?petName=${encodeURIComponent(
                  selectedPet.name,
                )}` as Href,
              );
            }}
            onMorePress={(record) => {
              handleSelectRecord(record);
            }}
          />
        ))}
      </ScreenContainer>
      <BottomSheet
        useScrollView
        visible={openForm}
        titleElement={
          <Body weight="semiBold">{t("medicalRecords.list.uploadTitle")}</Body>
        }
        onDismiss={handleCloseForm}
      >
        <MedicalRecordForm
          onSubmit={handleCreateMedicalRecord}
          loading={isCreating}
        />
      </BottomSheet>
      <BottomSheet
        visible={!!selectedRecord}
        onDismiss={handleClearSelectedRecord}
      >
        <Options
          data={[
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
          ]}
        />
      </BottomSheet>
      <Popup
        visible={!!openDeletePopup}
        onCancel={handleCloseDeletePopup}
        onConfirm={handleDelete}
        title={t("medicalRecords.list.popupTitle")}
        description={t("medicalRecords.list.popupDescription")}
        variant="delete"
        loading={isDeletingMedicalRecord}
      />
    </>
  );
};
