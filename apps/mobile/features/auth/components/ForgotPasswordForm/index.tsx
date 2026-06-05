import {
  forgotPasswordSchema,
  IForgotPasswordForm,
} from "@/constants/validation";
import { PhoneInputController } from "@/components/PhoneInputController";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";

interface IProps {
  onSubmit: (data: IForgotPasswordForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const ForgotPasswordForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { control, handleSubmit } = useForm<IForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <View className="gap-40">
      <PhoneInputController<IForgotPasswordForm>
        control={control}
        placeholder="Enter your phone number"
        label="Phone"
        name="phone"
      />

      <Button onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting}>
        Send Reset OTP
      </Button>
    </View>
  );
};
