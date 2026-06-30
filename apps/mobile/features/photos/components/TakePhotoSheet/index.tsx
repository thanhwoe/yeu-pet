import { PaywallNotice } from "@/components/PaywallNotice";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { CaptionInput } from "@/features/photos/components/CaptionInput";
import { SubmitButton } from "@/features/photos/components/SubmitButton";
import { PHOTO_COMPOSER_PREVIEW_SIZE } from "@/features/photos/utils";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { withIconClassName } from "@/hocs/withIconClassName";
import { uploadPhotoMutation } from "@/services";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePickerAsset } from "expo-image-picker";
import { XIcon } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const CloseIcon = withIconClassName(XIcon);

interface IProps {
  visible: boolean;
  image?: ImagePickerAsset;
  onDismiss: () => void;
}

export const TakePhotoSheet = ({ onDismiss, visible, image }: IProps) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>("");
  const queryClient = useQueryClient();
  const {
    entitlements,
    getLimitState,
    isError: isEntitlementsError,
    isLoading: isEntitlementsLoading,
    isUpgrading,
    refetch: refetchEntitlements,
    upgrade,
  } = useEntitlements();
  const photoLimit = getLimitState("maxPhotos");
  const limitBenefits = useMemo(() => {
    const benefits = t("photos.limit.benefits", {
      returnObjects: true,
    });

    return Array.isArray(benefits) ? benefits.map(String) : [];
  }, [t]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadPhotoMutation,
    onSuccess() {
      Toast.success({
        title: t("photos.toast.sharedTitle"),
        text: t("photos.toast.sharedText"),
      });
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      setCaption("");
      onDismiss();
    },
    onError(e) {
      Toast.error(
        getApiErrorToast(e, {
          titleKey: "photos.toast.shareErrorTitle",
          textKey: "photos.toast.shareErrorText",
        }),
      );
    },
  });

  const handleDismiss = useCallback(() => {
    setCaption("");
    onDismiss();
  }, [onDismiss]);

  const handleToggleVisibility = useCallback(() => {
    if (!isPending) {
      setChecked((value) => !value);
    }
  }, [isPending]);

  const renderSheetHeader = useCallback(
    () => (
      <View className="h-48 flex-row items-center justify-end px-20">
        <TouchableOpacity
          accessibilityLabel={t("photos.accessibility.closeComposer")}
          accessibilityRole="button"
          activeOpacity={0.82}
          className="h-40 w-40 mt-10 items-center justify-center rounded-full bg-background-card-highlight"
          onPress={handleDismiss}
        >
          <CloseIcon size={20} weight="bold" className="text-icon-primary" />
        </TouchableOpacity>
      </View>
    ),
    [handleDismiss, t],
  );

  const handleSubmit = async () => {
    if (!photoLimit.allowed) {
      Toast.error({
        title: t("photos.limit.reachedTitle"),
        text: t("photos.limit.reachedText", { limit: photoLimit.limit }),
      });
      return;
    }

    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      Toast.warn({
        title: t("photos.toast.captionRequiredTitle"),
        text: t("photos.toast.captionRequiredText"),
      });
      return;
    }

    if (image) {
      await mutateAsync({
        caption: trimmedCaption,
        isPrivate: !checked,
        image,
      });
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onDismiss={handleDismiss}
      keyboardBehavior="interactive"
      handleComponent={renderSheetHeader}
    >
      <View className="items-center gap-16 px-20 pb-8">
        {isEntitlementsLoading && !entitlements ? (
          <StateView
            variant="loading"
            title={t("photos.limit.loadingTitle")}
            description={t("photos.limit.loadingDescription")}
            className="w-full"
          />
        ) : isEntitlementsError && !entitlements ? (
          <StateView
            variant="error"
            title={t("photos.limit.errorTitle")}
            description={t("photos.limit.errorDescription")}
            actionLabel={t("common.tryAgain")}
            onAction={() => void refetchEntitlements()}
            className="w-full"
          />
        ) : !photoLimit.allowed ? (
          <PaywallNotice
            variant="blocking"
            title={t("photos.limit.reachedTitle")}
            description={t("photos.limit.reachedDescription")}
            benefits={limitBenefits}
            loading={isUpgrading}
            onAction={() => void upgrade()}
          />
        ) : (
          <>
            <View style={styles.previewFrame}>
              <Image source={{ uri: image?.uri }} style={styles.previewImage} />
              <View className="absolute bottom-12 left-12 right-12">
                <CaptionInput
                  fullWidth
                  value={caption}
                  placeholder={t("photos.composer.captionPlaceholder")}
                  onChangeText={setCaption}
                />
              </View>
            </View>
            <View className="w-full flex-row items-center justify-center gap-16">
              <SubmitButton onPress={handleSubmit} disabled={isPending} />
              <TouchableOpacity
                accessibilityLabel={t("photos.accessibility.togglePublic")}
                accessibilityRole="button"
                activeOpacity={0.82}
                className="h-52 flex-row items-center gap-8 rounded-full border-hairline border-line-primary bg-background-card px-16"
                disabled={isPending}
                onPress={handleToggleVisibility}
              >
                <View
                  className={[
                    "h-18 w-18 items-center justify-center rounded-full border-2",
                    checked ? "border-line-secondary" : "border-line-primary",
                  ].join(" ")}
                >
                  {checked && (
                    <View className="h-8 w-8 rounded-full bg-background-primary" />
                  )}
                </View>
                <Text variant="subhead" className="font-medium">
                  {t("photos.composer.public")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  previewFrame: {
    borderRadius: 24,
    height: PHOTO_COMPOSER_PREVIEW_SIZE,
    overflow: "hidden",
    width: PHOTO_COMPOSER_PREVIEW_SIZE,
  },
  previewImage: {
    height: "100%",
    width: "100%",
  },
});
