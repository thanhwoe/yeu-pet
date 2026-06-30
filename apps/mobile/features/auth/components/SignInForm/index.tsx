import { InputController } from "@/components/InputController";
import { PhoneInputController } from "@/components/PhoneInputController";
import { AppKeyboardAvoidingView } from "@/components/keyboard";
import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";
import { ISignInForm } from "@/constants/validation";
import { createSignInSchema } from "@/features/auth/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface IProps {
  onSubmit: (data: ISignInForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const SignInForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSignInSchema(t), [t]);
  const { control, handleSubmit } = useForm<ISignInForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <AppKeyboardAvoidingView className="gap-8">
      <PhoneInputController<ISignInForm>
        control={control}
        placeholder={t("auth.form.phone.placeholder")}
        label={t("auth.form.phone.label")}
        name="phone"
      />
      <InputController<ISignInForm>
        control={control}
        name="password"
        label={t("auth.form.password.label")}
        placeholder={t("auth.form.password.placeholder")}
        secureTextEntry
      />
      <Link href="/forgot-password" className="self-end my-6" replace>
        <Body className="text-text-link">{t("auth.form.forgotPassword")}</Body>
      </Link>

      <Button onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting}>
        {t("auth.common.signIn")}
      </Button>
    </AppKeyboardAvoidingView>
  );
};
