import { ISignInForm, signInSchema } from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { InputController } from "../InputController";

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
      <InputController<ISignInForm>
        control={control}
        placeholder="Enter your phone number"
        label="Phone"
        name="phoneNumber"
      />
      <InputController<ISignInForm>
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
        <Text className="text-slate-50 font-bold">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};
