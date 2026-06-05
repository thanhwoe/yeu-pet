import { Toast } from "@/components/Toast";
import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet } from "@/interfaces";
import { deletePetMutation, updatePetMutation } from "@/services";
import { formatPetWeight } from "@/utils/pet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export const usePetCardSection = () => {
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

        const data = old.data.map((item) => {
          if (item.id === res.id) {
            return { ...res, avatarUrl: res.avatarUrl ?? variable.avatar?.uri };
          }

          return item;
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

  const submitEdit = useCallback(
    async (data: IPetInfoForm) => {
      if (petEdit?.id) {
        await updatePet({ ...data, id: petEdit.id });
      }
    },
    [petEdit?.id, updatePet],
  );

  const confirmDelete = useCallback(async () => {
    if (petDelete?.id) {
      await deletePet(petDelete.id);
    }
  }, [deletePet, petDelete?.id]);

  const cancelDelete = useCallback(() => setPetDelete(undefined), []);

  const closeEdit = useCallback(() => setPetEdit(undefined), []);

  const defaultValues: IPetInfoForm | undefined = useMemo(() => {
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
      weight: formatPetWeight(petEdit),
      notes: petEdit.notes,
    } as IPetInfoForm;
  }, [petEdit]);

  return {
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
  };
};
