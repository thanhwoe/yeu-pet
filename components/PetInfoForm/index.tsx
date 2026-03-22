import { IPetInfoForm, petInfoSchema } from "@/constants/validation";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { date } from "@/utils";
import { calculateAnimalAge } from "@/utils/pet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { AvatarInputController } from "../AvatarInputController";
import { DateTimePickerController } from "../DatetimePickerController";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { UnitInputController } from "../UnitInputController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: IPetInfoForm) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: IPetInfoForm;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const EnhancedUnitInputController =
  withBottomSheetKeyboardEvents(UnitInputController);

export const PetInfoForm = ({
  onSubmit,
  defaultValues,
  isSubmitting,
}: IProps) => {
  const { control, handleSubmit, watch } = useForm<IPetInfoForm>({
    resolver: zodResolver(petInfoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });
  const [birthdate, species] = watch(["birthdate", "species"]);

  const age = useMemo(() => {
    const result = calculateAnimalAge(birthdate, species);
    if (!result) {
      return "";
    }
    const { days, humanYears, months, years } = result;

    return `${years} years, ${months} months, ${days} days. ${humanYears} human years`;
  }, [birthdate, species]);

  return (
    <KeyboardAvoidingView
      className="px-26 gap-8 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AvatarInputController<IPetInfoForm>
        control={control}
        name="avatar"
        label="Upload avatar"
      />
      <EnhancedInputController<IPetInfoForm>
        control={control}
        name="name"
        label="Name"
        placeholder="Your pet name"
      />

      <View className="flex-row gap-16">
        <OptionInputController<IPetInfoForm>
          control={control}
          name="gender"
          label="Gender"
          placeholder="Gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Unknown", value: "unknown" },
          ]}
        />
        <OptionInputController<IPetInfoForm>
          control={control}
          name="species"
          label="Species"
          placeholder="Species"
          options={[
            { label: "Dog", value: "dog" },
            { label: "Cat", value: "cat" },
            { label: "Bird", value: "bird" },
            { label: "Rabbit", value: "rabbit" },
            { label: "Hamster", value: "hamster" },
            { label: "Other", value: "other" },
          ]}
        />
      </View>

      <EnhancedInputController<IPetInfoForm>
        control={control}
        name="breed"
        label="Breed"
        placeholder="Husky"
      />

      <EnhancedInputController<IPetInfoForm>
        control={control}
        name="color"
        label="Color"
        placeholder="Orange"
      />

      <EnhancedUnitInputController<IPetInfoForm>
        control={control}
        name="weight"
        label="Weight"
        inputMode="numeric"
        placeholder="0.0"
        options={[
          { label: "Kilogram", value: "kg" },
          { label: "Pound", value: "lbs" },
        ]}
      />
      <DateTimePickerController
        name="birthdate"
        control={control}
        label="Birthdate"
        placeholder="Select date"
        mode="date"
        format={(val) => date(val).format("LL")}
        supportText={age}
      />

      <EnhancedInputController<IPetInfoForm>
        control={control}
        name="notes"
        label="Notes"
        placeholder="Notes"
        multiline
      />

      <Button
        wrapperClassName="mt-12"
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        {!!defaultValues ? "Update Pet" : "Add Pet"}
      </Button>
    </KeyboardAvoidingView>
  );
};
