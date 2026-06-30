import { InputController } from "@/components/InputController";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { USER_KEY } from "@/constants/query-keys";
import {
  cancelEmailChangeMutation,
  resendEmailChangeOtpMutation,
  verifyEmailChangeMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { withIconClassName } from "@/hocs/withIconClassName";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon, EnvelopeSimpleIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";

const ArrowLeft = withIconClassName(ArrowLeftIcon);
const EnvelopeSimple = withIconClassName(EnvelopeSimpleIcon);

type OtpForm = {
  otp: string;
};

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const secondsUntil = (value?: string) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000));
};

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

export function VerifyEmailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    requestId?: string;
    newEmail?: string;
    maskedEmail?: string;
    expiresAt?: string;
    resendAvailableAt?: string;
  }>();
  const queryClient = useQueryClient();
  const updateUser = useUserInfoStore.use.updateUser();
  const requestId = getParam(params.requestId);
  const [expiresAt, setExpiresAt] = useState(getParam(params.expiresAt) ?? "");
  const [resendAvailableAt, setResendAvailableAt] = useState(
    getParam(params.resendAvailableAt) ?? "",
  );
  const [, setTick] = useState(0);
  const maskedEmail = getParam(params.maskedEmail) || getParam(params.newEmail);
  const otpSchema = useMemo(
    () =>
      z.object({
        otp: z.string().trim().regex(/^\d{6}$/, t("profile.validation.otp")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<{ otp: string }, unknown, OtpForm>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const expirySeconds = secondsUntil(expiresAt);
  const resendSeconds = secondsUntil(resendAvailableAt);

  const { mutateAsync: verifyEmail, isPending: isVerifying } = useMutation({
    mutationFn: verifyEmailChangeMutation,
    onSuccess: ({ account }) => {
      updateUser(account);
      queryClient.setQueryData(USER_KEY.detail(account.id), account);
    },
  });

  const { mutateAsync: resendCode, isPending: isResending } = useMutation({
    mutationFn: resendEmailChangeOtpMutation,
    onSuccess: (request) => {
      setExpiresAt(request.expiresAt);
      setResendAvailableAt(request.resendAvailableAt ?? "");
      Toast.success({
        title: t("profile.toast.codeSentTitle"),
        text: t("profile.toast.codeSentText"),
      });
    },
  });

  const { mutateAsync: cancelChange, isPending: isCancelling } = useMutation({
    mutationFn: cancelEmailChangeMutation,
  });

  const handleVerify = useCallback(
    async ({ otp }: OtpForm) => {
      if (!requestId) return;

      try {
        await verifyEmail({ requestId, otp });
        Toast.success({
          title: t("profile.toast.emailUpdatedTitle"),
          text: t("profile.toast.emailUpdatedText"),
        });
        router.replace("/profile");
      } catch (error) {
        Toast.error({
          title: t("profile.toast.codeNotVerifiedTitle"),
          text:
            error instanceof Error
              ? error.message
              : t("profile.toast.codeNotVerifiedFallback"),
        });
      }
    },
    [requestId, t, verifyEmail],
  );

  const handleResend = useCallback(async () => {
    if (!requestId || resendSeconds > 0) return;

    try {
      await resendCode({ requestId });
    } catch (error) {
      Toast.error({
        title: t("profile.toast.codeNotSentTitle"),
        text:
          error instanceof Error
            ? error.message
            : t("profile.toast.codeNotSentFallback"),
      });
    }
  }, [requestId, resendCode, resendSeconds, t]);

  const handleCancel = useCallback(() => {
    if (!requestId) return;

    Alert.alert(
      t("profile.verifyEmail.cancelAlertTitle"),
      t("profile.verifyEmail.cancelAlertMessage"),
      [
        { text: t("profile.verifyEmail.cancelAlertKeep"), style: "cancel" },
        {
          text: t("profile.verifyEmail.cancelAlertConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelChange({ requestId });
              Toast.success({
                title: t("profile.toast.emailChangeCancelledTitle"),
                text: t("profile.toast.emailChangeCancelledText"),
              });
              router.replace("/profile");
            } catch (error) {
              Toast.error({
                title: t("profile.toast.cancelFailedTitle"),
                text:
                  error instanceof Error
                    ? error.message
                    : t("profile.toast.cancelFailedFallback"),
              });
            }
          },
        },
      ],
    );
  }, [cancelChange, requestId, t]);

  if (!requestId || !maskedEmail) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title={t("profile.verifyEmail.unavailableTitle")}
          description={t("profile.verifyEmail.unavailableDescription")}
          actionLabel={t("profile.verifyEmail.backToProfile")}
          onAction={() => router.replace("/profile")}
          className="flex-1"
        />
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
            accessibilityLabel={t("profile.accessibility.goBack")}
            onPress={() => router.back()}
            className="h-44 w-44 items-center justify-center rounded-full bg-background-surface"
          >
            <ArrowLeft size={22} className="text-icon-primary" />
          </Pressable>
          <View className="flex-1">
            <Text variant="largeTitle" className="font-bold">
              {t("profile.verifyEmail.title")}
            </Text>
            <Text variant="footnote" className="text-text-muted">
              {t("profile.verifyEmail.codeSentTo", { email: maskedEmail })}
            </Text>
          </View>
        </View>

        <View className="items-center gap-12 rounded-24 border-hairline border-line-subtle bg-background-surface px-20 py-24">
          <View className="h-58 w-58 items-center justify-center rounded-full bg-background-surface-muted">
            <EnvelopeSimple size={28} className="text-icon-secondary" />
          </View>
          <Text variant="title3" className="text-center font-bold">
            {t("profile.verifyEmail.checkInbox")}
          </Text>
          <Text variant="body2" className="text-center text-text-muted">
            {t("profile.verifyEmail.description")}
          </Text>
          <View className="rounded-full bg-background-surface-muted px-12 py-6">
            <Text variant="caption1" className="font-semibold text-text-muted">
              {t("profile.verifyEmail.expiresIn", {
                time: formatSeconds(expirySeconds),
              })}
            </Text>
          </View>
        </View>

        <View className="gap-16 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
          <InputController<{ otp: string }, OtpForm>
            control={control}
            name="otp"
            label={t("profile.form.verificationCode.label")}
            placeholder={t("profile.form.verificationCode.placeholder")}
            keyboardType="number-pad"
            maxLength={6}
            format={(value) => value.replace(/\D/g, "").slice(0, 6)}
          />

          <Button
            disabled={!isValid || expirySeconds <= 0}
            loading={isVerifying}
            onPress={() => handleSubmit(handleVerify)()}
          >
            {t("profile.verifyEmail.action")}
          </Button>

          <Button
            variant="outline"
            disabled={resendSeconds > 0 || isResending}
            loading={isResending}
            onPress={handleResend}
          >
            {resendSeconds > 0
              ? t("profile.verifyEmail.resendIn", {
                  time: formatSeconds(resendSeconds),
                })
              : t("profile.verifyEmail.resend")}
          </Button>
        </View>

        <Button variant="ghost" loading={isCancelling} onPress={handleCancel}>
          {t("profile.verifyEmail.cancel")}
        </Button>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
