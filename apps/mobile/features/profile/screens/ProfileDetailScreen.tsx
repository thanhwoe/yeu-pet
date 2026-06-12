import { InputController } from "@/components/InputController";
import { Toast } from "@/components/Toast";
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
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { z } from "zod";

const ArrowLeft = withIconClassName(ArrowLeftIcon);
const Camera = withIconClassName(CameraIcon);
const EnvelopeSimple = withIconClassName(EnvelopeSimpleIcon);

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const profileDetailSchema = z.object({
  firstName: z.string().trim().min(2, "First name is too short").max(50),
  lastName: z.string().trim().min(2, "Last name is too short").max(50),
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

type ProfileDetailInput = z.input<typeof profileDetailSchema>;
type ProfileDetailForm = z.output<typeof profileDetailSchema>;

const normalizeEmail = (email?: string | null) =>
  email?.trim().toLowerCase() ?? "";

const getDisplayName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(" ") || "YeuPet owner";

export function ProfileDetailScreen() {
  const user = useUserInfoStore.use.user();
  const updateUser = useUserInfoStore.use.updateUser();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState<UploadFileParam | null>(null);

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
      queryClient.setQueryData(USER_KEY.detail(updatedUser.id), updatedUser);
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
      onSuccess: ({ profile }) => {
        syncUser(profile);
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
        "Photo access needed",
        "Allow photo access to choose a new profile picture.",
        [{ text: "OK" }],
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
      Toast.error({ text: "Choose an image under 5MB." });
      return;
    }

    setAvatar({
      uri: asset.uri,
      type: asset.mimeType ?? "image/jpeg",
      name: asset.fileName ?? `avatar_${Date.now()}.jpg`,
      size: asset.fileSize,
    });
  }, []);

  const handleSave = useCallback(
    async (data: ProfileDetailForm) => {
      if (!user) return;

      const nameChanged =
        data.firstName !== user.firstName || data.lastName !== user.lastName;
      const emailChanged =
        normalizeEmail(data.email) !== normalizeEmail(user.email);

      if (!nameChanged && !emailChanged && !avatar) {
        Toast.warn({ text: "No profile changes to save." });
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

        Toast.success({ text: "Profile updated." });
        router.back();
      } catch (error) {
        Toast.error({
          text:
            error instanceof Error
              ? error.message
              : "Could not save profile. Please try again.",
        });
      }
    },
    [avatar, requestEmailChange, updateProfile, uploadAvatar, user],
  );

  if (!user) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text variant="title3" className="text-center font-semibold">
          Profile unavailable
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollEnabled className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-24 px-20 pb-120 pt-safe-offset-14"
      >
        <View className="flex-row items-center gap-12">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
              accessibilityLabel="Profile avatar"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
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
              {getDisplayName(user.firstName, user.lastName)}
            </Text>
            <Text variant="footnote" className="text-text-muted">
              {user.email ?? user.phone}
            </Text>
          </View>
          <Button size="sm" variant="outline" onPress={handlePickAvatar}>
            Change photo
          </Button>
        </View>

        <View className="gap-14 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
          <InputController<ProfileDetailInput, ProfileDetailForm>
            control={control}
            name="firstName"
            label="First name"
            placeholder="First name"
            autoCapitalize="words"
          />
          <InputController<ProfileDetailInput, ProfileDetailForm>
            control={control}
            name="lastName"
            label="Last name"
            placeholder="Last name"
            autoCapitalize="words"
          />
          <InputController<ProfileDetailInput, ProfileDetailForm>
            control={control}
            name="email"
            label="Email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            prefix={
              <EnvelopeSimple size={18} className="text-icon-secondary" />
            }
          />
        </View>

        <Button
          disabled={!isDirty && !avatar}
          loading={isSaving}
          onPress={() => handleSubmit(handleSave)()}
        >
          Save changes
        </Button>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
