import { PetCardCarousel } from "@/components/PetCardCarousel";
import { PetInfoForm } from "@/components/PetInfoForm";
import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body } from "@/components/ui/Typography";
import { usePetCardSection } from "@/features/pets/usePetCardSection";

export const PetCardSection = () => {
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
        titleElement={<Body weight="semiBold">Edit pet</Body>}
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
        title="Remove Pet"
        description="Are you sure you want to remove this pet?"
        variant="delete"
      />
    </>
  );
};
