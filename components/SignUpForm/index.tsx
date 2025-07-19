import { ISignUpForm, signUpSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { InputController } from "../InputController";
import { PhoneInputController } from "../PhoneInputController";

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
    <View className="gap-2">
      <PhoneInputController<ISignUpForm>
        control={control}
        placeholder="Enter your phone number"
        name="phoneNumber"
        label="Phone"
      />
      <InputController<ISignUpForm>
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
        className="bg-purple-500 py-5 items-center rounded-2xl mt-5"
      >
        <Text className="text-slate-50 font-bold">Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};
