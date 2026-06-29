import { ImageGallery, ImageGalleryRef } from "@/components/ImageGallery";
import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Body, Heading } from "@/components/ui/Typography";
import { MedicalRecordForm } from "@/features/medical-records/components/MedicalRecordForm";
import { MedicalRecordStatusChip } from "@/features/medical-records/components/MedicalRecordStatusChip";
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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          accessibilityLabel={t("medicalRecords.detail.options")}
        >
          <OptionsIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, [handleOpenOptions, navigation, t]);

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

      <SectionCard title={t("medicalRecords.detail.information")}>
        <InfoRow
          label={t("medicalRecords.detail.description")}
          value={data.description}
          multiline
        />
        <InfoRow
          label={t("medicalRecords.detail.vetClinic")}
          value={data.vetClinic}
        />
        <InfoRow
          label={t("medicalRecords.detail.vetName")}
          value={data.vetName}
        />
      </SectionCard>

      <AttachmentSection
        data={data}
        onOpen={(index) => galleryRef.current?.open(index)}
      />
      <ImageGallery data={recordImages} ref={galleryRef} />

      <BottomSheet visible={!!openOptions} onDismiss={handleCloseOptions}>
        <Options
          data={[
            {
              label: t("medicalRecords.actions.edit"),
              value: data,
              onPress: handleOpenEditForm,
              icon: <EditIcon size={24} className="text-icon-primary" />,
            },
            {
              label: t("medicalRecords.actions.delete"),
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
        titleElement={
          <Body weight="semiBold">{t("medicalRecords.detail.editTitle")}</Body>
        }
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
        title={t("medicalRecords.list.popupTitle")}
        description={t("medicalRecords.list.popupDescription")}
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
  const { t } = useTranslation();

  return (
    <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-18 py-18 shadow-sm">
      <View className="flex-row items-start justify-between gap-12">
        <Heading variant="h6" weight="bold" className="min-w-0 flex-1">
          {data.title}
        </Heading>
        <MedicalRecordStatusChip status={data.attachmentStatus} />
      </View>

      <View className="gap-8">
        <MedicalRecordType type={data.recordType} />

        <Body variant="body2" weight="semiBold" className="text-text-emphasis">
          {petName}
        </Body>
        <Body variant="body4" className="text-text-muted">
          {t("medicalRecords.detail.date", {
            date: date(data.date).format("LL"),
          })}
        </Body>
      </View>

      <Body variant="body4" className="text-text-muted">
        {t("medicalRecords.detail.recordId", { id: shortID(data.id) })}
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

const InfoRow = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) => {
  const { t } = useTranslation();
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
        {hasValue ? value : t("medicalRecords.detail.notProvided")}
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
  const { t } = useTranslation();
  const hasAttachments = data.medicalAttachments.length > 0;

  return (
    <View className="gap-12">
      <View className="flex-row items-center justify-between gap-12">
        <Heading variant="h6" weight="bold">
          {t("medicalRecords.attachments.label")}
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
  const { t } = useTranslation();

  if (status === "processing") {
    return (
      <StateCard
        icon={<ProcessingIcon size={22} className="text-status-warning-icon" />}
        title={t("medicalRecords.attachments.processingTitle")}
        description={t("medicalRecords.attachments.processingDescription")}
      />
    );
  }

  if (status === "failed") {
    return (
      <StateCard
        icon={<FailedIcon size={22} className="text-status-danger-icon" />}
        title={t("medicalRecords.attachments.processingFailedTitle")}
        description={t(
          "medicalRecords.attachments.processingFailedDescription",
        )}
      />
    );
  }

  return (
    <StateCard
      icon={
        <AttachmentIcon size={22} className="text-feature-medical-accent" />
      }
      title={t("medicalRecords.attachments.noneTitle")}
      description={t("medicalRecords.attachments.noneDescription")}
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
  const { t } = useTranslation();
  const imageUri = attachment.thumbnailUrl || attachment.url;
  const canUseAttachment = !!attachment.url && status !== "processing";

  return (
    <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-12 py-12 shadow-sm">
      <View className="flex-row gap-12">
        <TouchableOpacity
          onPress={() => onOpen(index)}
          disabled={!canUseAttachment}
          accessibilityRole="imagebutton"
          accessibilityLabel={t("medicalRecords.attachments.viewAttachment", {
            index: index + 1,
          })}
          className={cn(
            "h-72 w-72 overflow-hidden rounded-18 bg-background-surface-muted",
            !canUseAttachment && "opacity-60",
          )}
        >
          <Image source={{ uri: imageUri }} className="h-full w-full" />
        </TouchableOpacity>

        <View className="min-w-0 flex-1 justify-center gap-5">
          <Body variant="body3" weight="semiBold" numberOfLines={1}>
            {t("medicalRecords.attachments.image")}
          </Body>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            {t("medicalRecords.attachments.attachmentId", {
              id: shortID(attachment.id),
            })}
          </Body>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            {t("medicalRecords.attachments.uploaded", {
              date: date(attachment.createdAt).format("L"),
            })}
          </Body>
        </View>
      </View>

      <View className="flex-row gap-8">
        <AttachmentAction
          label={t("medicalRecords.attachments.view")}
          disabled={!canUseAttachment}
          icon={<ViewIcon size={18} className="text-icon-primary" />}
          onPress={() => onOpen(index)}
        />
        <AttachmentAction
          label={t("medicalRecords.actions.save")}
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
