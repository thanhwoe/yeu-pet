import { ImageGallery, ImageGalleryRef } from "@/components/ImageGallery";
import { MedicalRecordForm } from "@/components/MedicalRecordForm";
import { Popup } from "@/components/Popup";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Body, Heading } from "@/components/ui/Typography";
import { MEDICAL_RECORDS_KEY } from "@/constants/query-keys";
import { IMedicalRecordForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  deleteMedicalRecordMutation,
  getMedicalRecordDetailQuery,
  updateMedicalRecordMutation,
} from "@/services";
import { cn, date, shortID } from "@/utils";
import { saveImageToGallery } from "@/utils/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  DotsThreeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { MedicalRecordType } from "./MedicalRecordType";

const ViewIcon = withIconClassName(EyeIcon);
const DownloadIcon = withIconClassName(DownloadSimpleIcon);
const OptionsIcon = withIconClassName(DotsThreeIcon);
const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);

export const MedicalRecordDetailScreen = () => {
  const [openOptions, setOpenOptions] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const galleryRef = useRef<ImageGalleryRef>(null);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: MEDICAL_RECORDS_KEY.detail(id),
    queryFn: () => getMedicalRecordDetailQuery(id),
    enabled: !!id,
  });

  const {
    mutateAsync: updateMedicalRecord,
    isPending: isUpdatingMedicalRecord,
  } = useMutation({
    mutationFn: updateMedicalRecordMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEY.detail(id),
      });
      setOpenEditForm(false);
      setOpenOptions(false);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });

      setOpenDeletePopup(false);
      setOpenOptions(false);
      navigation.goBack();
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleDelete = () => {
    if (data?.id) {
      deleteMedicalRecord(data.id);
    }
  };
  const handleUpdateMedicalRecord = async (payload: IMedicalRecordForm) => {
    if (data?.id) {
      updateMedicalRecord({
        id: data.id,
        ...payload,
      });
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={() => setOpenOptions(true)}
        >
          <OptionsIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const recordImages = useMemo(
    () => data?.medicalAttachments.map((attachment) => attachment.url) ?? [],
    [data],
  );

  if (!data || isLoading) {
    return null;
  }

  return (
    <ScreenContainer
      scrollEnabled
      contentContainerClassName="px-20 gap-20 pt-20"
    >
      <View className="gap-8 p-16 rounded-16 bg-background-card-highlight">
        <View className="flex-row items-center justify-between">
          <Heading variant="h6" weight="bold">
            {data?.title}
          </Heading>
          <MedicalRecordType type={data?.recordType} />
        </View>
        <View className="flex-row items-center justify-between">
          <Body variant="body3" className="text-text-tertiary-inverse">
            {date(data?.date).format("LL")}
          </Body>
          <Body variant="body3" className="text-text-tertiary-inverse">
            ID: {shortID(data?.id)}
          </Body>
        </View>
      </View>

      <View
        className={cn("p-16 rounded-16 bg-background-card-highlight gap-12", {
          hidden: !data.description && !data.vetClinic && !data.vetName,
        })}
      >
        {data.description && (
          <View className="gap-8">
            <Body weight="bold">Description</Body>
            <Body variant="body2" className="text-text-tertiary-inverse">
              {data.description}
            </Body>
          </View>
        )}

        {data.vetClinic && (
          <View className="gap-8">
            <Body weight="bold">Vet Clinic</Body>
            <Body variant="body2" className="text-text-tertiary-inverse">
              {data.vetClinic}
            </Body>
          </View>
        )}

        {data.vetName && (
          <View className="gap-8">
            <Body weight="bold">Vet Name</Body>
            <Body variant="body2" className="text-text-tertiary-inverse">
              {data.vetName}
            </Body>
          </View>
        )}
      </View>

      <View className="gap-16">
        <Heading variant="h5">Medical Attachments</Heading>
        {data.medicalAttachments.map((attachment, index) => (
          <View
            key={attachment.id}
            className="flex-row p-16 rounded-16 gap-12 bg-background-card-highlight items-center"
          >
            <Image
              source={{ uri: attachment.thumbnailUrl }}
              className="size-40"
            />
            <View className="flex-1">
              <Body>Attachment {shortID(attachment.id)}</Body>
            </View>
            <View className="flex-row gap-16">
              <TouchableOpacity onPress={() => galleryRef.current?.open(index)}>
                <ViewIcon size={24} className="text-icon-primary" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => saveImageToGallery(attachment.url)}
              >
                <DownloadIcon size={24} className="text-icon-primary" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <ImageGallery data={recordImages} ref={galleryRef} />

      <BottomSheet
        visible={!!openOptions}
        onDismiss={() => setOpenOptions(false)}
      >
        <Options
          data={[
            {
              label: "Edit",
              value: data,
              onPress: () => {
                setOpenEditForm(true);
              },
              icon: <EditIcon size={24} className="text-icon-primary" />,
            },
            {
              label: "Delete",
              value: data,
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
      <BottomSheet
        useScrollView
        visible={openEditForm}
        titleElement={<Body weight="semiBold">Edit medical record</Body>}
        onDismiss={() => {
          setOpenEditForm(false);
        }}
      >
        <MedicalRecordForm
          onSubmit={handleUpdateMedicalRecord}
          loading={isUpdatingMedicalRecord}
          {...(data && {
            defaultValues: {
              petId: data.petId,
              recordType: data.recordType,
              title: data.title,
              date: dayjs(data.date).toDate(),
              description: data.description ?? "",
              vetClinic: data.vetClinic ?? "",
              vetName: data.vetName ?? "",
              attachmentIds: data.medicalAttachments.map((attachment) => ({
                id: attachment.id,
                url: attachment.thumbnailUrl,
                name: `Attachment ${shortID(attachment.id)}`,
              })),
            },
          })}
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
    </ScreenContainer>
  );
};
