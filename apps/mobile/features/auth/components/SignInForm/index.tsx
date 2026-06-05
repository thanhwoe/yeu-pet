import { ISignInForm, signInSchema } from "@/constants/validation";
import { InputController } from "@/components/InputController";
import { PhoneInputController } from "@/components/PhoneInputController";
import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";

interface IProps {
  onSubmit: (data: ISignInForm) => Promise<void>;
  isSubmitting?: boolean;
}

export const SignInForm = ({ onSubmit, isSubmitting }: IProps) => {
  const { control, handleSubmit } = useForm<ISignInForm>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  return (
    <KeyboardAvoidingView
      className="gap-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
      <Link href="/forgot-password" className="self-end my-6" replace>
        <Body className="text-text-link">Forgot Password</Body>
      </Link>

      <Button onPress={() => handleSubmit(onSubmit)()} loading={isSubmitting}>
        Sign In
      </Button>
    </KeyboardAvoidingView>
  );
};
