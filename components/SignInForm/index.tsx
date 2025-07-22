import { ISignInForm, signInSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { InputController } from "../InputController";
import { PhoneInputController } from "../PhoneInputController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: ISignInForm) => Promise<void>;
}

export const SignInForm = ({ onSubmit }: IProps) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<ISignInForm>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const handleSubmitForm = (data: ISignInForm) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };

  return (
    <View className="gap-2">
      <PhoneInputController<ISignInForm>
        control={control}
        placeholder="Enter your phone number"
        label="Phone"
        name="phone"
      />
      <InputController<ISignInForm>
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        secureTextEntry
      />
      <Button
        size="CTA"
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
      >
        Sign In
      </Button>
    </View>
  );
};
