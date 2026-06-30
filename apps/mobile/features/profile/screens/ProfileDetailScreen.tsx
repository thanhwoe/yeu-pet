import { InputController } from "@/components/InputController";
import { Toast } from "@/components/Toast";
import { AppKeyboardAwareScrollView } from "@/components/keyboard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { USER_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IUser, UploadFileParam } from "@/interfaces";
import {
  requestEmailChangeMutation,
  updateMeProfileMutation,
  uploadMeAvatarMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  ArrowLeftIcon,
  CameraIcon,
  EnvelopeSimpleIcon,
} from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { z } from "zod/v4";

const ArrowLeft = withIconClassName(ArrowLeftIcon);
const Camera = withIconClassName(CameraIcon);
const EnvelopeSimple = withIconClassName(EnvelopeSimpleIcon);

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

type ProfileDetailInput = {
  firstName: string;
  lastName: string;
  email: string;
};

type ProfileDetailForm = ProfileDetailInput;

const normalizeEmail = (email?: string | null) =>
  email?.trim().toLowerCase() ?? "";

const getDisplayName = (
  firstName: string | undefined,
  lastName: string | undefined,
  fallback: string,
) => [firstName, lastName].filter(Boolean).join(" ") || fallback;

export function ProfileDetailScreen() {
  const { t } = useTranslation();
  const user = useUserInfoStore.use.user();
  const updateUser = useUserInfoStore.use.updateUser();
  const setOptimisticUserAvatar =
    useUserInfoStore.use.setOptimisticUserAvatar();
  const rollbackOptimisticUserAvatar =
    useUserInfoStore.use.rollbackOptimisticUserAvatar();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState<UploadFileParam | null>(null);
  const profileDetailSchema = useMemo(
    () =>
      z.object({
        firstName: z
          .string()
          .trim()
          .min(2, t("profile.validation.firstName"))
          .max(50),
        lastName: z
          .string()
          .trim()
          .min(2, t("profile.validation.lastName"))
          .max(50),
        email: z.email(t("profile.validation.email")).trim().toLowerCase(),
      }),
    [t],
  );

  const defaultValues = useMemo<ProfileDetailInput>(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    }),
    [user?.email, user?.firstName, user?.lastName],
  );

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProfileDetailInput, unknown, ProfileDetailForm>({
    resolver: zodResolver(profileDetailSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const syncUser = useCallback(
    (updatedUser: IUser) => {
      updateUser(updatedUser);
      const effectiveUser = useUserInfoStore.getState().user ?? updatedUser;

      queryClient.setQueryData(
        USER_KEY.detail(effectiveUser.id),
        effectiveUser,
      );
    },
    [queryClient, updateUser],
  );

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: updateMeProfileMutation,
      onSuccess: syncUser,
    });

  const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } =
    useMutation({
      mutationFn: uploadMeAvatarMutation,
      onMutate: async (nextAvatar) => {
        if (!user) return undefined;

        await queryClient.cancelQueries({
          queryKey: USER_KEY.detail(user.id),
        });

        const previousUser = queryClient.getQueryData<IUser>(
          USER_KEY.detail(user.id),
        );

        setOptimisticUserAvatar(nextAvatar.uri);

        const optimisticUser = useUserInfoStore.getState().user;
        if (optimisticUser) {
          queryClient.setQueryData(
            USER_KEY.detail(optimisticUser.id),
            optimisticUser,
          );
        }

        return { previousUser };
      },
      onSuccess: ({ profile }) => {
        syncUser(profile);
      },
      onError: (_error, _nextAvatar, context) => {
        rollbackOptimisticUserAvatar();

        if (context?.previousUser) {
          queryClient.setQueryData(
            USER_KEY.detail(context.previousUser.id),
            context.previousUser,
          );
        }
      },
    });

  const { mutateAsync: requestEmailChange, isPending: isRequestingEmail } =
    useMutation({
      mutationFn: requestEmailChangeMutation,
    });

  const isSaving = isUpdatingProfile || isUploadingAvatar || isRequestingEmail;
  const avatarUri = avatar?.uri ?? user?.avatarUrl ?? "";

  const handlePickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t("profile.photoPermission.title"),
        t("profile.photoPermission.message"),
        [{ text: t("common.ok") }],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE) {
      Toast.error({
        title: t("profile.toast.avatarTooLargeTitle"),
        text: t("profile.toast.avatarTooLargeText"),
      });
      return;
    }

    setAvatar({
      uri: asset.uri,
      type: asset.mimeType ?? "image/jpeg",
      name: asset.fileName ?? `avatar_${Date.now()}.jpg`,
      size: asset.fileSize,
    });
  }, [t]);

  const handleSave = useCallback(
    async (data: ProfileDetailForm) => {
      if (!user) return;

      const nameChanged =
        data.firstName !== user.firstName || data.lastName !== user.lastName;
      const emailChanged =
        normalizeEmail(data.email) !== normalizeEmail(user.email);

      if (!nameChanged && !emailChanged && !avatar) {
        Toast.warn({
          title: t("profile.toast.nothingToSaveTitle"),
          text: t("profile.toast.nothingToSaveText"),
        });
        return;
      }

      try {
        if (nameChanged) {
          await updateProfile({
            firstName: data.firstName,
            lastName: data.lastName,
          });
        }

        if (avatar) {
          await uploadAvatar(avatar);
          setAvatar(null);
        }

        if (emailChanged) {
          const request = await requestEmailChange({ newEmail: data.email });
          router.push({
            pathname: "/profile/verify-email",
            params: {
              requestId: request.requestId,
              newEmail: request.newEmail,
              maskedEmail: request.maskedEmail,
              expiresAt: request.expiresAt,
              resendAvailableAt: request.resendAvailableAt ?? "",
            },
          });
          return;
        }

        Toast.success({
          title: t("profile.toast.profileUpdatedTitle"),
          text: t("profile.toast.profileUpdatedText"),
        });
        router.back();
      } catch (error) {
        Toast.error({
          title: t("profile.toast.profileNotUpdatedTitle"),
          text:
            error instanceof Error
              ? error.message
              : t("profile.toast.profileNotUpdatedFallback"),
        });
      }
    },
    [avatar, requestEmailChange, t, updateProfile, uploadAvatar, user],
  );

  if (!user) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text variant="title3" className="text-center font-semibold">
          {t("profile.detail.profileUnavailable")}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <AppKeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-24 px-20 pb-120 pt-safe-offset-14"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center gap-12">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.accessibility.goBack")}
          onPress={() => router.back()}
          className="h-44 w-44 items-center justify-center rounded-full bg-background-surface"
        >
          <ArrowLeft size={22} className="text-icon-primary" />
        </Pressable>
      </View>

      <View className="items-center gap-12 rounded-24 border-hairline border-line-subtle bg-background-surface px-20 py-22">
        <View>
          <Avatar
            size="huge"
            source={{ uri: avatarUri }}
            onPress={handlePickAvatar}
            accessibilityLabel={t("profile.accessibility.profileAvatar")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.accessibility.changePhoto")}
            onPress={handlePickAvatar}
            className="absolute -bottom-2 -right-6 h-38 w-38 items-center justify-center rounded-full bg-background-primary"
          >
            <Camera
              size={19}
              weight="fill"
              className="text-icon-primary-inverse"
            />
          </Pressable>
        </View>
        <View className="items-center gap-2">
          <Text variant="title3" className="font-bold">
            {getDisplayName(
              user.firstName,
              user.lastName,
              t("profile.detail.fallbackName"),
            )}
          </Text>
          <Text variant="footnote" className="text-text-muted">
            {user.phone}
          </Text>
          {user.email && (
            <Text variant="footnote" className="text-text-muted">
              {user.email}
            </Text>
          )}
        </View>
      </View>

      <View className="gap-14 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
        <InputController<ProfileDetailInput, ProfileDetailForm>
          control={control}
          name="firstName"
          label={t("profile.form.firstName.label")}
          placeholder={t("profile.form.firstName.placeholder")}
          autoCapitalize="words"
        />
        <InputController<ProfileDetailInput, ProfileDetailForm>
          control={control}
          name="lastName"
          label={t("profile.form.lastName.label")}
          placeholder={t("profile.form.lastName.placeholder")}
          autoCapitalize="words"
        />
        <InputController<ProfileDetailInput, ProfileDetailForm>
          control={control}
          name="email"
          label={t("profile.form.email.label")}
          placeholder={t("profile.form.email.placeholder")}
          keyboardType="email-address"
          autoCapitalize="none"
          prefix={<EnvelopeSimple size={18} className="text-icon-secondary" />}
        />
      </View>

      <Button
        disabled={!isDirty && !avatar}
        loading={isSaving}
        onPress={() => handleSubmit(handleSave)()}
      >
        {t("profile.detail.saveChanges")}
      </Button>
    </AppKeyboardAwareScrollView>
  );
}
