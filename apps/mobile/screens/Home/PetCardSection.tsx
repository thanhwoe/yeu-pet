import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body } from "@/components/ui/Typography";
import { PetCardCarousel } from "@/features/pets/components/PetCardCarousel";
import { PetInfoForm } from "@/features/pets/components/PetInfoForm";
import { usePetCardSection } from "@/features/pets/usePetCardSection";
import { useTranslation } from "react-i18next";

export const PetCardSection = () => {
  const { t } = useTranslation();
  const {
    petEdit,
    petDelete,
    defaultValues,
    isUpdating,
    isDeleting,
    setPetEdit,
    setPetDelete,
    submitEdit,
    confirmDelete,
    cancelDelete,
    closeEdit,
  } = usePetCardSection();

  return (
    <>
      <PetCardCarousel onDelete={setPetDelete} onEdit={setPetEdit} />
      <BottomSheet
        stackBehavior="push"
        visible={!!petEdit}
        onDismiss={closeEdit}
        titleElement={<Body weight="semiBold">{t("pets.popup.editTitle")}</Body>}
      >
        <PetInfoForm
          onSubmit={submitEdit}
          defaultValues={defaultValues}
          isSubmitting={isUpdating}
        />
      </BottomSheet>
      <Popup
        visible={!!petDelete}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title={t("pets.popup.deleteTitle")}
        description={t("pets.popup.deleteDescription")}
        variant="delete"
      />
    </>
  );
};
