import { ISignInForm, signInSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { InputController } from "../InputController";
import { PhoneInputController } from "../PhoneInputController";
import { Button } from "../ui/Button";

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
    <View className="gap-8">
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
        wrapperClassName="mt-24"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        Sign In
      </Button>
    </View>
  );
};
