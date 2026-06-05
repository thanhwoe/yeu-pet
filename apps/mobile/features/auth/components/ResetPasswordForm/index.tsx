import {
  IResetPasswordForm,
  resetPasswordSchema,
} from "@/constants/validation";
import { InputController } from "@/components/InputController";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";

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
  const { control, handleSubmit } = useForm<IResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
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
        placeholder="Enter your phone number"
        label="Phone"
        name="phone"
        editable={false}
      />
      <InputController<IResetPasswordForm>
        control={control}
        name="password"
        label="New Password"
        placeholder="Enter new password"
        secureTextEntry
      />
      <InputController<IResetPasswordForm>
        control={control}
        name="code"
        label="OTP code"
        placeholder="OTP code"
      />

      {children}

      <Button
        wrapperClassName="mt-8"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        Reset password
      </Button>
    </KeyboardAvoidingView>
  );
};
