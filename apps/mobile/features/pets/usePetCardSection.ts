import { Toast } from "@/components/Toast";
import { PET_KEY, SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { IPagination, IPet, SubscriptionEntitlements } from "@/interfaces";
import { deletePetMutation, updatePetMutation } from "@/services";
import { formatPetWeight } from "@/utils/pet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const toPetGender = (value?: string | null): IPetInfoForm["gender"] => {
  if (value === "male" || value === "female" || value === "unknown") {
    return value;
  }

  return undefined;
};

const toPetSpecies = (value?: string | null): IPetInfoForm["species"] => {
  if (
    value === "dog" ||
    value === "cat" ||
    value === "bird" ||
    value === "rabbit" ||
    value === "hamster" ||
    value === "other"
  ) {
    return value;
  }

  return undefined;
};

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
    onSuccess(_, petId) {
      setPetDelete(undefined);
      queryClient.setQueryData(PET_KEY.list(), (old: IPagination<IPet>) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          data: old.data.filter((item) => item.id !== petId),
          meta: {
            ...old.meta,
            total: Math.max(0, old.meta.total - 1),
          },
        };
      });
      queryClient.setQueryData(
        SUBSCRIPTION_KEY.entitlements(),
        (old: SubscriptionEntitlements | undefined) =>
          old
            ? {
                ...old,
                usage: {
                  ...old.usage,
                  pets: Math.max(0, old.usage.pets - 1),
                },
              }
            : old,
      );
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
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
      color: petEdit.color ?? undefined,
      gender: toPetGender(petEdit.gender),
      name: petEdit.name,
      avatar: petEdit.avatarUrl
        ? {
            uri: petEdit.avatarUrl,
            name: "default",
            type: "image/jpeg",
          }
        : null,
      species: toPetSpecies(petEdit.species),
      birthdate: petEdit.birthdate ? new Date(petEdit.birthdate) : null,
      breed: petEdit.breed ?? undefined,
      weight: formatPetWeight(petEdit),
      notes: petEdit.notes ?? undefined,
    };
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
