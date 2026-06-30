import { InputController } from "@/components/InputController";
import { PhoneInputController } from "@/components/PhoneInputController";
import { AppKeyboardAvoidingView } from "@/components/keyboard";
import { Button } from "@/components/ui/Button";
import { ISignUpForm } from "@/constants/validation";
import { createSignUpSchema } from "@/features/auth/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface IProps {
  onSubmit: (data: ISignUpForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const SignUpForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSignUpSchema(t), [t]);
  const { control, handleSubmit } = useForm<ISignUpForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <AppKeyboardAvoidingView className="gap-8">
      <PhoneInputController<ISignUpForm>
        control={control}
        placeholder={t("auth.form.phone.placeholder")}
        name="phone"
        label={t("auth.form.phone.label")}
      />
      <InputController<ISignUpForm>
        control={control}
        name="password"
        label={t("auth.form.password.label")}
        placeholder={t("auth.form.password.placeholder")}
        secureTextEntry
      />
      <InputController<ISignUpForm>
        control={control}
        name="firstName"
        label={t("auth.form.firstName.label")}
        placeholder={t("auth.form.firstName.placeholder")}
      />
      <InputController<ISignUpForm>
        control={control}
        name="lastName"
        label={t("auth.form.lastName.label")}
        placeholder={t("auth.form.lastName.placeholder")}
      />
      <Button
        wrapperClassName="mt-24"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        {t("auth.common.signUp")}
      </Button>
    </AppKeyboardAvoidingView>
  );
};
