import { PhoneInputController } from "@/components/PhoneInputController";
import { Button } from "@/components/ui/Button";
import { IForgotPasswordForm } from "@/constants/validation";
import { createForgotPasswordSchema } from "@/features/auth/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface IProps {
  onSubmit: (data: IForgotPasswordForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const ForgotPasswordForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);
  const { control, handleSubmit } = useForm<IForgotPasswordForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <View className="gap-40">
      <PhoneInputController<IForgotPasswordForm>
        control={control}
        placeholder={t("auth.form.phone.placeholder")}
        label={t("auth.form.phone.label")}
        name="phone"
      />

      <Button onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting}>
        {t("auth.form.sendResetOtp")}
      </Button>
    </View>
  );
};
