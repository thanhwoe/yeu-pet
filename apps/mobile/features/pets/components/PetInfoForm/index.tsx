import {
  IPetInfoForm,
  IPetInfoFormInput,
  petInfoSchema,
} from "@/constants/validation";
import { AvatarInputController } from "@/components/AvatarInputController";
import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { UnitInputController } from "@/components/UnitInputController";
import { Button } from "@/components/ui/Button";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { date } from "@/utils";
import { calculateAnimalAge } from "@/utils/pet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

interface IProps {
  onSubmit: (data: IPetInfoForm) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: IPetInfoForm;
  disabled?: boolean;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const EnhancedUnitInputController =
  withBottomSheetKeyboardEvents(UnitInputController);

const GENDER_OPTIONS = [
  { labelKey: "pets.gender.male", value: "male" },
  { labelKey: "pets.gender.female", value: "female" },
  { labelKey: "pets.gender.unknown", value: "unknown" },
];

const SPECIES_OPTIONS = [
  { labelKey: "pets.species.dog", value: "dog" },
  { labelKey: "pets.species.cat", value: "cat" },
  { labelKey: "pets.species.bird", value: "bird" },
  { labelKey: "pets.species.rabbit", value: "rabbit" },
  { labelKey: "pets.species.hamster", value: "hamster" },
  { labelKey: "pets.species.other", value: "other" },
];

const WEIGHT_UNIT_OPTIONS = [
  { labelKey: "pets.unit.kilogram", value: "kg" },
  { labelKey: "pets.unit.pound", value: "lb" },
];

export const PetInfoForm = ({
  onSubmit,
  defaultValues,
  isSubmitting,
  disabled,
}: IProps) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<IPetInfoFormInput, unknown, IPetInfoForm>({
    resolver: zodResolver(petInfoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });
  const [birthdate, species] = watch(["birthdate", "species"]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const genderOptions = useMemo(
    () =>
      GENDER_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );
  const speciesOptions = useMemo(
    () =>
      SPECIES_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );
  const weightUnitOptions = useMemo(
    () =>
      WEIGHT_UNIT_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );

  const age = useMemo(() => {
    const birthdateValue =
      birthdate instanceof Date || typeof birthdate === "string"
        ? birthdate
        : null;
    const speciesValue = typeof species === "string" ? species : null;
    const result = calculateAnimalAge(birthdateValue, speciesValue);

    if (!result) {
      return "";
    }
    const { days, humanYears, months, years } = result;

    return t("pets.form.ageSummary", {
      days,
      humanYears,
      months,
      years,
    });
  }, [birthdate, species, t]);

  return (
    <KeyboardAvoidingView
      className="px-26 gap-8 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AvatarInputController<IPetInfoFormInput, IPetInfoForm>
        control={control}
        name="avatar"
        label={t("pets.form.avatar.label")}
      />
      <EnhancedInputController
        control={control}
        name="name"
        label={t("pets.form.name.label")}
        placeholder={t("pets.form.name.placeholder")}
      />

      <View className="flex-row gap-16">
        <OptionInputController<IPetInfoFormInput, IPetInfoForm>
          control={control}
          name="gender"
          label={t("pets.form.gender.label")}
          placeholder={t("pets.form.gender.placeholder")}
          options={genderOptions}
        />
        <OptionInputController<IPetInfoFormInput, IPetInfoForm>
          control={control}
          name="species"
          label={t("pets.form.species.label")}
          placeholder={t("pets.form.species.placeholder")}
          options={speciesOptions}
        />
      </View>

      <EnhancedInputController
        control={control}
        name="breed"
        label={t("pets.form.breed.label")}
        placeholder={t("pets.form.breed.placeholder")}
      />

      <EnhancedInputController
        control={control}
        name="color"
        label={t("pets.form.color.label")}
        placeholder={t("pets.form.color.placeholder")}
      />

      <EnhancedUnitInputController
        control={control}
        name="weight"
        label={t("pets.form.weight.label")}
        keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
        placeholder={t("pets.form.weight.placeholder")}
        options={weightUnitOptions}
      />
      <DateTimePickerController<IPetInfoFormInput, IPetInfoForm>
        name="birthdate"
        control={control}
        label={t("pets.form.birthdate.label")}
        placeholder={t("pets.form.birthdate.placeholder")}
        mode="date"
        maximumDate={new Date()}
        format={(val) => date(val).format("LL")}
        supportText={age}
      />

      <EnhancedInputController
        control={control}
        name="notes"
        label={t("pets.form.notes.label")}
        placeholder={t("pets.form.notes.placeholder")}
        multiline
      />

      <Button
        wrapperClassName="mt-12"
        disabled={disabled || isSubmitting}
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        {defaultValues ? t("pets.actions.update") : t("pets.actions.add")}
      </Button>
    </KeyboardAvoidingView>
  );
};
