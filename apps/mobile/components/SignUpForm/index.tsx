import { ISignUpForm, signUpSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { InputController } from "../InputController";
import { PhoneInputController } from "../PhoneInputController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: ISignUpForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const SignUpForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { control, handleSubmit } = useForm<ISignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <KeyboardAvoidingView
      className="gap-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        wrapperClassName="mt-24"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        Sign Up
      </Button>
    </KeyboardAvoidingView>
  );
};
