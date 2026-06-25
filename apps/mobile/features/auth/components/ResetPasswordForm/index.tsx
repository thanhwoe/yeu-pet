import { InputController } from "@/components/InputController";
import { Button } from "@/components/ui/Button";
import { IResetPasswordForm } from "@/constants/validation";
import { createResetPasswordSchema } from "@/features/auth/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, useMemo } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";

interface IProps extends PropsWithChildren {
  onSubmit: (data: IResetPasswordForm) => Promise<void>;
  isSubmitting?: boolean;
  phoneNumber: string;
}

export const ResetPasswordForm = ({
  onSubmit,
  isSubmitting,
  phoneNumber,
  children,
}: IProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const { control, handleSubmit } = useForm<IResetPasswordForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      phone: phoneNumber,
    },
  });

  return (
    <KeyboardAvoidingView
      className="gap-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <InputController<IResetPasswordForm>
        control={control}
        placeholder={t("auth.form.phone.placeholder")}
        label={t("auth.form.phone.label")}
        name="phone"
        editable={false}
      />
      <InputController<IResetPasswordForm>
        control={control}
        name="password"
        label={t("auth.form.newPassword.label")}
        placeholder={t("auth.form.newPassword.placeholder")}
        secureTextEntry
      />
      <InputController<IResetPasswordForm>
        control={control}
        name="code"
        label={t("auth.form.otpCode.label")}
        placeholder={t("auth.form.otpCode.placeholder")}
      />

      {children}

      <Button
        wrapperClassName="mt-8"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        {t("auth.form.resetPassword")}
      </Button>
    </KeyboardAvoidingView>
  );
};
