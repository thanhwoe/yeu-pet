import { InputController } from "@/components/InputController";
import { Button } from "@/components/ui/Button";
import {
  IProfileForm,
  IProfileFormInput,
  profileSchema,
} from "@/constants/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";

interface ProfileFormProps {
  defaultValues: IProfileFormInput;
  isSubmitting?: boolean;
  onSubmit: (data: IProfileForm) => Promise<void>;
}

export function ProfileForm({
  defaultValues,
  isSubmitting,
  onSubmit,
}: ProfileFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IProfileFormInput, unknown, IProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  return (
    <KeyboardAvoidingView
      className="gap-12 px-24 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <InputController<IProfileFormInput, IProfileForm>
        control={control}
        name="firstName"
        label="First name"
        placeholder="First name"
      />
      <InputController<IProfileFormInput, IProfileForm>
        control={control}
        name="lastName"
        label="Last name"
        placeholder="Last name"
      />
      <InputController<IProfileFormInput, IProfileForm>
        control={control}
        name="email"
        label="Email"
        placeholder="Email"
        keyboardType="email-address"
      />

      <Button
        wrapperClassName="mt-16"
        disabled={!isDirty}
        loading={isSubmitting}
        onPress={() => handleSubmit(onSubmit)()}
      >
        Save profile
      </Button>
    </KeyboardAvoidingView>
  );
}
