import { PetCardCarousel } from "@/components/PetCardCarousel";
import { PetInfoForm } from "@/components/PetInfoForm";
import { Popup } from "@/components/Popup";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body } from "@/components/ui/Typography";
import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet } from "@/interfaces";
import { deletePetMutation, updatePetMutation } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export const PetCardSection = () => {
  const [petEdit, setPetEdit] = useState<IPet>();
  const [petDelete, setPetDelete] = useState<IPet>();

  const queryClient = useQueryClient();

  const { mutateAsync: updatePet, isPending: isUpdating } = useMutation({
    mutationFn: updatePetMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess(res, variable) {
      queryClient.setQueryData(PET_KEY.list(), (old: IPagination<IPet>) => {
        if (!old) {
          return old;
        }
        const data = old.data.map((i) => {
          if (i.id === res.id) {
            return { ...res, avatarUrl: res.avatarUrl ?? variable.avatar?.uri };
          }
          return i;
        });

        return {
          ...old,
          data,
        };
      });
      setPetEdit(undefined);
    },
  });

  const { mutateAsync: deletePet, isPending: isDeleting } = useMutation({
    mutationFn: deletePetMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      setPetDelete(undefined);
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
    },
  });

  const handleSubmit = useCallback(
    async (data: IPetInfoForm) => {
      if (petEdit?.id) {
        updatePet({ ...data, id: petEdit.id });
      }
    },
    [petEdit?.id, updatePet],
  );

  const handleDelete = useCallback(() => {
    if (petDelete?.id) {
      deletePet(petDelete.id);
    }
  }, [deletePet, petDelete?.id]);

  const handleCancel = useCallback(() => setPetDelete(undefined), []);

  const defaultValue: IPetInfoForm | undefined = useMemo(() => {
    if (!petEdit) {
      return;
    }
    return {
      color: petEdit.color ?? "",
      gender: petEdit.gender ?? "",
      name: petEdit.name,
      avatar: petEdit.avatarUrl
        ? {
            uri: petEdit.avatarUrl,
            name: "default",
            type: "image/jpeg",
          }
        : null,
      species: petEdit.species,
      birthdate: petEdit.birthdate,
      breed: petEdit.breed,
      weight: petEdit.weight,
      notes: petEdit.notes,
    };
  }, [petEdit]);

  return (
    <>
      <PetCardCarousel onDelete={setPetDelete} onEdit={setPetEdit} />
      <BottomSheet
        stackBehavior="push"
        visible={!!petEdit}
        onDismiss={() => setPetEdit(undefined)}
        titleElement={<Body weight="semiBold">Add your pet</Body>}
      >
        <PetInfoForm
          onSubmit={handleSubmit}
          defaultValues={defaultValue}
          isSubmitting={isUpdating}
        />
      </BottomSheet>
      <Popup
        visible={!!petDelete}
        onCancel={handleCancel}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Remove Pet"
        description="Are you sure you want to remove this pet?"
        variant="delete"
      />
    </>
  );
};
