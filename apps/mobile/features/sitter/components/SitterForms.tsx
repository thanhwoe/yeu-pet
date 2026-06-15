import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import {
  ISitterBookingFormInput,
  ISitterBookingFormValues,
  ISitterCancelForm,
  ISitterProfileForm,
  ISitterProfileFormInput,
  ISitterReviewFormValues,
  sitterBookingSchema,
  sitterCancelSchema,
  sitterProfileSchema,
  sitterReviewSchema,
} from "@/constants/validation";
import { IPet, IPetSitter, ISitterBookingForm } from "@/interfaces";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { Pressable, View } from "react-native";
import { RATING_OPTIONS, SERVICE_TYPE_OPTIONS } from "../constants";
import { createIdempotencyKey, getLocationLine, getSitterName } from "../utils";
import { ExternalPaymentNotice, SectionLabel } from "./SitterPrimitives";

export const BookingRequestForm = ({
  sitter,
  pets,
  onSubmit,
  loading,
}: {
  sitter: IPetSitter;
  pets: IPet[];
  onSubmit: (data: ISitterBookingForm) => Promise<void>;
  loading: boolean;
}) => {
  const petOptions = useMemo(
    () => pets.map((pet) => ({ label: pet.name, value: pet.id })),
    [pets],
  );

  const { control, handleSubmit } = useForm<
    ISitterBookingFormInput,
    unknown,
    ISitterBookingFormValues
  >({
    resolver: zodResolver(sitterBookingSchema),
    defaultValues: {
      petId: petOptions[0]?.value,
      type: "hourly",
      startTime: dayjs().add(1, "hour").toDate(),
      endTime: dayjs().add(2, "hour").toDate(),
      ownerNotes: "",
      careInstructions: "",
    },
  });

  const serviceType = useWatch({ control, name: "type" });

  const submit = (data: ISitterBookingFormValues) => {
    const isDaily = data.type === "daily";
    const startTime = isDaily
      ? dayjs(data.startTime).startOf("day").toISOString()
      : data.startTime.toISOString();
    const endTime = isDaily
      ? dayjs(data.endTime).endOf("day").toISOString()
      : data.endTime.toISOString();

    return onSubmit({
      idempotencyKey: createIdempotencyKey(),
      petId: data.petId,
      type: data.type,
      sitterId: sitter.id,
      startTime,
      endTime,
      ownerNotes: data.ownerNotes,
      careInstructions: data.careInstructions,
    });
  };

  if (!pets.length) {
    return (
      <StateView
        variant="empty"
        title="Add a pet first"
        description="Create a pet profile before requesting sitter care."
        className="min-h-160"
      />
    );
  }

  return (
    <View className="gap-16">
      <View className="flex-row items-center gap-12 rounded-20 border border-line-subtle bg-background-surface px-14 py-14">
        <Avatar
          size="medium"
          source={{ uri: sitter.account?.avatarUrl ?? undefined }}
        />
        <View className="flex-1">
          <Heading variant="h6" weight="bold" numberOfLines={1}>
            {getSitterName(sitter)}
          </Heading>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            {getLocationLine(sitter)}
          </Body>
        </View>
      </View>

      <ExternalPaymentNotice />

      <OptionInputController<ISitterBookingFormInput, ISitterBookingFormValues>
        control={control}
        name="petId"
        label="Pet"
        options={petOptions}
      />
      <OptionInputController<ISitterBookingFormInput, ISitterBookingFormValues>
        control={control}
        name="type"
        label="Service type"
        options={SERVICE_TYPE_OPTIONS}
      />
      <DateTimePickerController<
        ISitterBookingFormInput,
        ISitterBookingFormValues
      >
        control={control}
        name="startTime"
        label={serviceType === "daily" ? "Start date" : "Start time"}
        mode={serviceType === "daily" ? "date" : "datetime"}
        minimumDate={new Date()}
      />
      <DateTimePickerController<
        ISitterBookingFormInput,
        ISitterBookingFormValues
      >
        control={control}
        name="endTime"
        label={serviceType === "daily" ? "End date" : "End time"}
        mode={serviceType === "daily" ? "date" : "datetime"}
        minimumDate={new Date()}
      />
      <InputController<ISitterBookingFormInput, ISitterBookingFormValues>
        control={control}
        name="careInstructions"
        label="Care instructions"
        placeholder="Food, medicine, walks, or routines"
        multiline
        numberOfLines={3}
      />
      <InputController<ISitterBookingFormInput, ISitterBookingFormValues>
        control={control}
        name="ownerNotes"
        label="Owner notes"
        placeholder="Anything the sitter should know"
        multiline
        numberOfLines={3}
      />
      <Button loading={loading} onPress={() => handleSubmit(submit)()}>
        Send booking request
      </Button>
    </View>
  );
};

export const SitterProfileForm = ({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: IPetSitter | null;
  onSubmit: (data: ISitterProfileForm) => Promise<void>;
  loading: boolean;
}) => {
  const { control, handleSubmit } = useForm<
    ISitterProfileFormInput,
    unknown,
    ISitterProfileForm
  >({
    resolver: zodResolver(sitterProfileSchema),
    defaultValues: {
      displayName: defaultValues?.displayName ?? "",
      address: defaultValues?.address ?? "",
      city: defaultValues?.city ?? "",
      district: defaultValues?.district ?? "",
      ward: defaultValues?.ward ?? "",
      experience: defaultValues?.experience ?? "",
      bio: defaultValues?.bio ?? "",
      serviceNotes: defaultValues?.serviceNotes ?? "",
      hourlyRate: String(defaultValues?.hourlyRate ?? ""),
      dailyRate: String(defaultValues?.dailyRate ?? ""),
      maxConcurrentBookings: String(defaultValues?.maxConcurrentBookings ?? ""),
      isAvailable: defaultValues ? defaultValues.isAvailable : undefined,
    },
  });
  const {
    field: { value: isAvailable, onChange: setIsAvailable },
  } = useController({
    control,
    name: "isAvailable",
  });

  return (
    <View className="gap-18">
      {defaultValues ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Sitter availability"
          accessibilityState={{ checked: Boolean(isAvailable) }}
          onPress={() => setIsAvailable(!isAvailable)}
          className="flex-row items-center justify-between gap-16 rounded-22 border border-line-subtle bg-background-surface px-16 py-14"
        >
          <View className="flex-1">
            <Body variant="body3" weight="semiBold">
              Accept new requests
            </Body>
            <Body variant="body4" className="text-text-muted">
              Pause your profile when you are not available.
            </Body>
          </View>
          <View
            className={cn(
              "h-32 w-56 justify-center rounded-full p-3",
              isAvailable ? "bg-action-primary" : "bg-background-surface-muted",
            )}
          >
            <View
              className={cn(
                "h-26 w-26 rounded-full bg-background-surface shadow-card",
                isAvailable && "translate-x-24",
              )}
            />
          </View>
        </Pressable>
      ) : null}

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>Profile</SectionLabel>
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="displayName"
          label="Display name"
          placeholder="How owners will see you"
        />
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="bio"
          label="Bio"
          placeholder="Share your pet-care experience"
          multiline
          numberOfLines={3}
        />
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="experience"
          label="Experience"
          placeholder="3 years caring for dogs and cats"
        />
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>Service area</SectionLabel>
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="address"
          label="Service area"
          placeholder="District, city, or neighborhood"
        />
        <View className="flex-row gap-12">
          <InputController<ISitterProfileFormInput, ISitterProfileForm>
            control={control}
            name="city"
            label="City"
            placeholder="Da Nang"
            className="flex-1"
          />
          <InputController<ISitterProfileFormInput, ISitterProfileForm>
            control={control}
            name="district"
            label="District"
            placeholder="Hai Chau"
            className="flex-1"
          />
        </View>
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="ward"
          label="Ward"
          placeholder="Optional"
        />
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>Services</SectionLabel>
        <View className="flex-row gap-12">
          <InputController<ISitterProfileFormInput, ISitterProfileForm>
            control={control}
            name="hourlyRate"
            label="Hourly rate"
            keyboardType="numeric"
            placeholder="100000"
            className="flex-1"
          />
          <InputController<ISitterProfileFormInput, ISitterProfileForm>
            control={control}
            name="dailyRate"
            label="Daily rate"
            keyboardType="numeric"
            placeholder="700000"
            className="flex-1"
          />
        </View>
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="maxConcurrentBookings"
          label="Max bookings"
          keyboardType="numeric"
          placeholder="1"
        />
        <InputController<ISitterProfileFormInput, ISitterProfileForm>
          control={control}
          name="serviceNotes"
          label="Service notes"
          placeholder="Small pets, daytime walks, overnight care"
          multiline
          numberOfLines={3}
        />
      </View>

      <Button
        wrapperClassName="mx-14"
        loading={loading}
        onPress={() => handleSubmit(onSubmit)()}
      >
        {defaultValues ? "Save sitter profile" : "Create sitter profile"}
      </Button>
    </View>
  );
};

export const CancelForm = ({
  onSubmit,
  loading,
}: {
  onSubmit: (data: ISitterCancelForm) => Promise<void>;
  loading: boolean;
}) => {
  const { control, handleSubmit } = useForm<ISitterCancelForm>({
    resolver: zodResolver(sitterCancelSchema),
    defaultValues: { reason: "" },
  });

  return (
    <View className="gap-16">
      <InputController<ISitterCancelForm>
        control={control}
        name="reason"
        label="Reason"
        placeholder="Optional note for the other person"
        multiline
        numberOfLines={3}
      />
      <Button
        variant="destructive"
        loading={loading}
        onPress={() => handleSubmit(onSubmit)()}
      >
        Cancel booking
      </Button>
    </View>
  );
};

export const ReviewForm = ({
  onSubmit,
  loading,
}: {
  onSubmit: (data: ISitterReviewFormValues) => Promise<void>;
  loading: boolean;
}) => {
  const { control, handleSubmit } = useForm<ISitterReviewFormValues>({
    resolver: zodResolver(sitterReviewSchema),
    defaultValues: { rating: "5", comment: "" },
  });

  return (
    <View className="gap-16">
      <OptionInputController<ISitterReviewFormValues>
        control={control}
        name="rating"
        label="Rating"
        options={RATING_OPTIONS}
      />
      <InputController<ISitterReviewFormValues>
        control={control}
        name="comment"
        label="Review"
        placeholder="What went well?"
        multiline
        numberOfLines={4}
      />
      <Button loading={loading} onPress={() => handleSubmit(onSubmit)()}>
        Submit review
      </Button>
    </View>
  );
};
