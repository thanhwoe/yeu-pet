import { MedicalRecordForm } from "@/components/MedicalRecordForm";
import { Popup } from "@/components/Popup";
import { RefreshControl } from "@/components/RefreshControl";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Body } from "@/components/ui/Typography";
import { MEDICAL_RECORDS_KEY, PET_KEY } from "@/constants/query-keys";
import { IMedicalRecordForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import {
  createMedicalRecordMutation,
  deleteMedicalRecordMutation,
  getListPetQuery,
} from "@/services";
import { useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useNavigation, useRouter } from "expo-router";
import { PlusIcon, TrashIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { MedicalRecordContainer } from "./MedicalRecordContainer";

const AddIcon = withIconClassName(PlusIcon);
const DeleteIcon = withIconClassName(TrashIcon);

export const MedicalRecordScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null,
  );
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={() => setOpenForm(true)}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const {
    data: petData,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const { mutateAsync: createMedicalRecord, isPending: isCreating } =
    useMutation({
      mutationFn: createMedicalRecordMutation,
      onSuccess: () => {
        setOpenForm(false);

        queryClient.invalidateQueries({
          queryKey: MEDICAL_RECORDS_KEY.lists(),
        });
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

  const handleCreateMedicalRecord = async (data: IMedicalRecordForm) => {
    createMedicalRecord(data);
  };

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });

      setOpenDeletePopup(false);
      setSelectedRecord(null);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleDelete = () => {
    if (selectedRecord?.id) {
      deleteMedicalRecord(selectedRecord.id);
    }
  };
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
            onRefresh={() => {
              refetch();
              queryClient.invalidateQueries({
                queryKey: MEDICAL_RECORDS_KEY.lists(),
              });
            }}
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
              setSelectedRecord(record);
            }}
          />
        ))}
      </ScreenContainer>
      <BottomSheet
        useScrollView
        visible={openForm}
        titleElement={<Body weight="semiBold">Upload your medical record</Body>}
        onDismiss={() => {
          setOpenForm(false);
        }}
      >
        <MedicalRecordForm
          onSubmit={handleCreateMedicalRecord}
          loading={isCreating}
        />
      </BottomSheet>
      <BottomSheet
        visible={!!selectedRecord}
        onDismiss={() => setSelectedRecord(null)}
      >
        <Options
          data={[
            {
              label: "Delete",
              value: selectedRecord,
              onPress: () => {
                setOpenDeletePopup(true);
              },
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
        onCancel={() => setOpenDeletePopup(false)}
        onConfirm={handleDelete}
        title="Remove medical record"
        description="Are you sure you want to remove this medical record?"
        variant="delete"
        loading={isDeletingMedicalRecord}
      />
    </>
  );
};
