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
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ArrowLeft = withIconClassName(ArrowLeftIcon);
const EnvelopeSimple = withIconClassName(EnvelopeSimpleIcon);

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type OtpForm = z.output<typeof otpSchema>;

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
  const [tick, setTick] = useState(0);
  const maskedEmail = getParam(params.maskedEmail) || getParam(params.newEmail);

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

  const expirySeconds = useMemo(() => secondsUntil(expiresAt), [expiresAt, tick]);
  const resendSeconds = useMemo(
    () => secondsUntil(resendAvailableAt),
    [resendAvailableAt, tick],
  );

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
      Toast.success({ text: "Verification code sent." });
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
        Toast.success({ text: "Email updated." });
        router.replace("/profile");
      } catch (error) {
        Toast.error({
          text:
            error instanceof Error
              ? error.message
              : "Could not verify this code.",
        });
      }
    },
    [requestId, verifyEmail],
  );

  const handleResend = useCallback(async () => {
    if (!requestId || resendSeconds > 0) return;

    try {
      await resendCode({ requestId });
    } catch (error) {
      Toast.error({
        text:
          error instanceof Error
            ? error.message
            : "Could not resend the code.",
      });
    }
  }, [requestId, resendCode, resendSeconds]);

  const handleCancel = useCallback(() => {
    if (!requestId) return;

    Alert.alert(
      "Cancel email change?",
      "Your current email will stay on this account.",
      [
        { text: "Keep verifying", style: "cancel" },
        {
          text: "Cancel change",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelChange({ requestId });
              Toast.success({ text: "Email change cancelled." });
              router.replace("/profile");
            } catch (error) {
              Toast.error({
                text:
                  error instanceof Error
                    ? error.message
                    : "Could not cancel this change.",
              });
            }
          },
        },
      ],
    );
  }, [cancelChange, requestId]);

  if (!requestId || !maskedEmail) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title="Verification unavailable"
          description="Start an email change from your profile."
          actionLabel="Back to profile"
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
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-44 w-44 items-center justify-center rounded-full bg-background-surface"
          >
            <ArrowLeft size={22} className="text-icon-primary" />
          </Pressable>
          <View className="flex-1">
            <Text variant="largeTitle" className="font-bold">
              Verify email
            </Text>
            <Text variant="footnote" className="text-text-muted">
              Code sent to {maskedEmail}
            </Text>
          </View>
        </View>

        <View className="items-center gap-12 rounded-24 border-hairline border-line-subtle bg-background-surface px-20 py-24">
          <View className="h-58 w-58 items-center justify-center rounded-full bg-background-surface-muted">
            <EnvelopeSimple size={28} className="text-icon-secondary" />
          </View>
          <Text variant="title3" className="text-center font-bold">
            Check your inbox
          </Text>
          <Text variant="body2" className="text-center text-text-muted">
            Enter the 6-digit code before it expires.
          </Text>
          <View className="rounded-full bg-background-surface-muted px-12 py-6">
            <Text variant="caption1" className="font-semibold text-text-muted">
              Expires in {formatSeconds(expirySeconds)}
            </Text>
          </View>
        </View>

        <View className="gap-16 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
          <InputController<{ otp: string }, OtpForm>
            control={control}
            name="otp"
            label="Verification code"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            format={(value) => value.replace(/\D/g, "").slice(0, 6)}
          />

          <Button
            disabled={!isValid || expirySeconds <= 0}
            loading={isVerifying}
            onPress={() => handleSubmit(handleVerify)()}
          >
            Verify email
          </Button>

          <Button
            variant="outline"
            disabled={resendSeconds > 0 || isResending}
            loading={isResending}
            onPress={handleResend}
          >
            {resendSeconds > 0
              ? `Resend in ${formatSeconds(resendSeconds)}`
              : "Resend code"}
          </Button>
        </View>

        <Button variant="ghost" loading={isCancelling} onPress={handleCancel}>
          Cancel email change
        </Button>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
