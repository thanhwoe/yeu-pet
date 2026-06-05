import { ImageGallery, ImageGalleryRef } from "@/components/ImageGallery";
import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Body, Heading } from "@/components/ui/Typography";
import { MedicalRecordForm } from "@/features/medical-records/components/MedicalRecordForm";
import { MedicalRecordType } from "@/features/medical-records/components/MedicalRecordType";
import { useMedicalRecordDetail } from "@/features/medical-records/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn, date, shortID } from "@/utils";
import { saveImageToGallery } from "@/utils/image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  DotsThreeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "phosphor-react-native";
import { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

const ViewIcon = withIconClassName(EyeIcon);
const DownloadIcon = withIconClassName(DownloadSimpleIcon);
const OptionsIcon = withIconClassName(DotsThreeIcon);
const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);

export const MedicalRecordDetailScreen = () => {
  const navigation = useNavigation();
  const galleryRef = useRef<ImageGalleryRef>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data,
    defaultValues,
    isDeletingMedicalRecord,
    isLoading,
    isUpdatingMedicalRecord,
    openDeletePopup,
    openEditForm,
    openOptions,
    recordImages,
    handleCloseDeletePopup,
    handleCloseEditForm,
    handleCloseOptions,
    handleDelete,
    handleOpenDeletePopup,
    handleOpenEditForm,
    handleOpenOptions,
    handleUpdateMedicalRecord,
  } = useMedicalRecordDetail({
    id,
    onDeleted: () => navigation.goBack(),
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={handleOpenOptions}
        >
          <OptionsIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [handleOpenOptions, navigation]);

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
        onDismiss={handleCloseOptions}
      >
        <Options
          data={[
            {
              label: "Edit",
              value: data,
              onPress: handleOpenEditForm,
              icon: <EditIcon size={24} className="text-icon-primary" />,
            },
            {
              label: "Delete",
              value: data,
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
      <BottomSheet
        useScrollView
        visible={openEditForm}
        titleElement={<Body weight="semiBold">Edit medical record</Body>}
        onDismiss={handleCloseEditForm}
      >
        <MedicalRecordForm
          onSubmit={handleUpdateMedicalRecord}
          loading={isUpdatingMedicalRecord}
          defaultValues={defaultValues}
        />
      </BottomSheet>

      <Popup
        visible={!!openDeletePopup}
        onCancel={handleCloseDeletePopup}
        onConfirm={handleDelete}
        title="Remove medical record"
        description="Are you sure you want to remove this medical record?"
        variant="delete"
        loading={isDeletingMedicalRecord}
      />
    </ScreenContainer>
  );
};
