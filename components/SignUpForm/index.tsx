import { ISignUpForm, signUpSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { InputController } from "../InputController";
import { PhoneInputController } from "../PhoneInputController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: ISignUpForm) => Promise<void>;
}

export const SignUpForm = ({ onSubmit }: IProps) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<ISignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const handleSubmitForm = (data: ISignUpForm) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };

  return (
    <View>
      <PhoneInputController<ISignUpForm>
        control={control}
        placeholder="Enter your phone number"
        name="phone"
        label="Phone"
      />
      <InputController<ISignUpForm>
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        secureTextEntry
      />
      <InputController<ISignUpForm>
        control={control}
        name="email"
        label="Email (Optional)"
        placeholder="Email"
      />
      <InputController<ISignUpForm>
        control={control}
        name="firstName"
        label="First Name"
        placeholder="First Name"
      />
      <InputController<ISignUpForm>
        control={control}
        name="lastName"
        label="Last Name"
        placeholder="Last Name"
      />
      <Button
        size="CTA"
        className="mt-2"
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
        loading={isPending}
      >
        Sign Up
      </Button>
    </View>
  );
};
