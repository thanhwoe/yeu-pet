import { ImageGallery, ImageGalleryRef } from "@/components/ImageGallery";
import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Body, Heading } from "@/components/ui/Typography";
import { MedicalRecordStatusChip } from "@/features/medical-records/components/MedicalRecordStatusChip";
import { MedicalRecordForm } from "@/features/medical-records/components/MedicalRecordForm";
import { MedicalRecordType } from "@/features/medical-records/components/MedicalRecordType";
import { useMedicalRecordDetail } from "@/features/medical-records/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord, IMedicalRecordDetail } from "@/interfaces";
import { cn, date, shortID } from "@/utils";
import { saveImageToGallery } from "@/utils/image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  ClockIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  ImageSquareIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { ReactNode, useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

const ViewIcon = withIconClassName(EyeIcon);
const DownloadIcon = withIconClassName(DownloadSimpleIcon);
const OptionsIcon = withIconClassName(DotsThreeIcon);
const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const AttachmentIcon = withIconClassName(ImageSquareIcon);
const ProcessingIcon = withIconClassName(ClockIcon);
const FailedIcon = withIconClassName(WarningCircleIcon);

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
    petName,
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
          accessibilityRole="button"
          accessibilityLabel="Medical record options"
        >
          <OptionsIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [handleOpenOptions, navigation]);

  if (!data || isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Spinner className="text-icon-primary" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollEnabled
      contentContainerClassName="px-20 gap-20 pt-20 pb-safe-offset-20"
    >
      <HeroSummaryCard data={data} petName={petName} />

      <SectionCard title="Information">
        <InfoRow label="Description" value={data.description} multiline />
        <InfoRow label="Vet Clinic" value={data.vetClinic} />
        <InfoRow label="Vet Name" value={data.vetName} />
      </SectionCard>

      <AttachmentSection
        data={data}
        onOpen={(index) => galleryRef.current?.open(index)}
      />
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

const HeroSummaryCard = ({
  data,
  petName,
}: {
  data: IMedicalRecordDetail;
  petName?: string;
}) => {
  return (
    <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-18 py-18 shadow-sm">
      <View className="flex-row items-start justify-between gap-12">
        <Heading variant="h6" weight="bold" className="min-w-0 flex-1">
          {data.title}
        </Heading>
        <MedicalRecordStatusChip status={data.attachmentStatus} />
      </View>

      <View className="flex-row flex-wrap items-center gap-8">
        <MedicalRecordType type={data.recordType} />
        <MetaPill>{date(data.date).format("LL")}</MetaPill>
        {!!petName && <MetaPill>{petName}</MetaPill>}
      </View>

      <Body variant="body4" className="text-text-muted">
        Record ID {shortID(data.id)}
      </Body>
    </View>
  );
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
      <Heading variant="h6" weight="bold">
        {title}
      </Heading>
      <View className="gap-14">{children}</View>
    </View>
  );
};

const MetaPill = ({ children }: { children: ReactNode }) => {
  return (
    <View className="min-h-30 justify-center rounded-full bg-background-surface-muted px-10">
      <Body variant="body4" className="text-text-muted">
        {children}
      </Body>
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) => {
  const hasValue = !!value?.trim();

  return (
    <View className="gap-5 border-b border-line-subtle pb-12 last:border-b-0 last:pb-0">
      <Body variant="body4" weight="semiBold" className="text-text-muted">
        {label}
      </Body>
      <Body
        variant="body2"
        className={cn(hasValue ? "text-text-primary" : "text-text-muted")}
        numberOfLines={multiline ? undefined : 2}
      >
        {hasValue ? value : "Not provided"}
      </Body>
    </View>
  );
};

const AttachmentSection = ({
  data,
  onOpen,
}: {
  data: IMedicalRecordDetail;
  onOpen: (index: number) => void;
}) => {
  const hasAttachments = data.medicalAttachments.length > 0;

  return (
    <View className="gap-12">
      <View className="flex-row items-center justify-between gap-12">
        <Heading variant="h6" weight="bold">
          Medical attachments
        </Heading>
        <Body variant="body4" className="text-text-muted">
          {data.medicalAttachments.length}
        </Body>
      </View>

      {!hasAttachments ? (
        <AttachmentStateCard status={data.attachmentStatus} />
      ) : (
        data.medicalAttachments.map((attachment, index) => (
          <AttachmentCard
            key={attachment.id}
            attachment={attachment}
            index={index}
            status={data.attachmentStatus}
            onOpen={onOpen}
          />
        ))
      )}
    </View>
  );
};

const AttachmentStateCard = ({
  status,
}: {
  status: IMedicalRecord["attachmentStatus"];
}) => {
  if (status === "processing") {
    return (
      <StateCard
        icon={<ProcessingIcon size={22} className="text-status-warning-icon" />}
        title="Attachments are processing"
        description="Images will appear here when processing finishes."
      />
    );
  }

  if (status === "failed") {
    return (
      <StateCard
        icon={<FailedIcon size={22} className="text-status-danger-icon" />}
        title="Attachment processing failed"
        description="Edit this record and upload the image again."
      />
    );
  }

  return (
    <StateCard
      icon={<AttachmentIcon size={22} className="text-feature-medical-accent" />}
      title="No attachments yet"
      description="Add photos or documents when you edit this record."
    />
  );
};

const StateCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <View className="flex-row gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
      <View className="h-42 w-42 items-center justify-center rounded-14 bg-background-surface-muted">
        {icon}
      </View>
      <View className="min-w-0 flex-1 gap-4">
        <Body variant="body3" weight="semiBold">
          {title}
        </Body>
        <Body variant="body4" className="text-text-muted">
          {description}
        </Body>
      </View>
    </View>
  );
};

const AttachmentCard = ({
  attachment,
  index,
  status,
  onOpen,
}: {
  attachment: IMedicalRecordDetail["medicalAttachments"][number];
  index: number;
  status: IMedicalRecord["attachmentStatus"];
  onOpen: (index: number) => void;
}) => {
  const imageUri = attachment.thumbnailUrl || attachment.url;
  const canUseAttachment = !!attachment.url && status !== "processing";

  return (
    <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-12 py-12 shadow-sm">
      <View className="flex-row gap-12">
        <TouchableOpacity
          onPress={() => onOpen(index)}
          disabled={!canUseAttachment}
          accessibilityRole="imagebutton"
          accessibilityLabel={`View medical attachment ${index + 1}`}
          className={cn(
            "h-72 w-72 overflow-hidden rounded-18 bg-background-surface-muted",
            !canUseAttachment && "opacity-60",
          )}
        >
          <Image source={{ uri: imageUri }} className="h-full w-full" />
        </TouchableOpacity>

        <View className="min-w-0 flex-1 justify-center gap-5">
          <Body variant="body3" weight="semiBold" numberOfLines={1}>
            Medical image
          </Body>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            Attachment {shortID(attachment.id)}
          </Body>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            Uploaded {date(attachment.createdAt).format("L")}
          </Body>
        </View>
      </View>

      <View className="flex-row gap-8">
        <AttachmentAction
          label="View"
          disabled={!canUseAttachment}
          icon={<ViewIcon size={18} className="text-icon-primary" />}
          onPress={() => onOpen(index)}
        />
        <AttachmentAction
          label="Save"
          disabled={!canUseAttachment}
          icon={<DownloadIcon size={18} className="text-icon-primary" />}
          onPress={() => saveImageToGallery(attachment.url)}
        />
      </View>
    </View>
  );
};

const AttachmentAction = ({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn(
        "min-h-40 flex-1 flex-row items-center justify-center gap-6 rounded-full border border-line-subtle bg-background-surface-muted px-12",
        disabled && "opacity-50",
      )}
    >
      {icon}
      <Body variant="body4" weight="semiBold">
        {label}
      </Body>
    </TouchableOpacity>
  );
};
