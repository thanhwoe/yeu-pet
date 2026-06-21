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
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { Pressable, View } from "react-native";
import { RATING_OPTIONS, SERVICE_TYPE_OPTIONS } from "../constants";
import {
  createIdempotencyKey,
  formatRate,
  getLocationLine,
  getSitterName,
} from "../utils";
import { SectionLabel } from "./SitterPrimitives";

const BottomSheetInputController =
  withBottomSheetKeyboardEvents(InputController);

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

const getDefaultHourlyStart = () =>
  dayjs().add(1, "hour").second(0).millisecond(0);

const getDefaultHourlyEnd = () => getDefaultHourlyStart().add(1, "hour");

const getDefaultDailyStart = () => dayjs().add(1, "day").startOf("day");

const getDefaultDailyEnd = () => getDefaultDailyStart().endOf("day");

const getNumberRate = (value: string | number) => {
  const rate = Number(value || 0);

  return Number.isFinite(rate) ? rate : 0;
};

const getBookingEstimate = ({
  dailyRate,
  endTime,
  hourlyRate,
  startTime,
  type,
}: {
  dailyRate: string | number;
  endTime?: Date;
  hourlyRate: string | number;
  startTime?: Date;
  type?: "hourly" | "daily";
}) => {
  if (!type || !startTime || !endTime) {
    return null;
  }

  const start =
    type === "daily" ? dayjs(startTime).startOf("day") : dayjs(startTime);
  const end = type === "daily" ? dayjs(endTime).endOf("day") : dayjs(endTime);
  const diffMs = end.diff(start);

  if (diffMs <= 0) {
    return null;
  }

  if (type === "daily") {
    const days = Math.ceil(diffMs / DAY_MS);
    const rate = getNumberRate(dailyRate);

    return {
      total: rate * days,
      summary: `${days} day${days > 1 ? "s" : ""} · ${formatRate(rate)} / day`,
      range: `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`,
    };
  }

  const hours = diffMs / HOUR_MS;
  const normalizedHours = Number(hours.toFixed(2));
  const rate = getNumberRate(hourlyRate);
  const hourLabel = `hour${normalizedHours > 1 ? "s" : ""}`;

  return {
    total: rate * normalizedHours,
    summary: `${normalizedHours} ${hourLabel} · ${formatRate(rate)} / hour`,
    range: `${start.format("DD MMM, HH:mm")} - ${end.format("HH:mm")}`,
  };
};

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

  const { control, handleSubmit, setValue } = useForm<
    ISitterBookingFormInput,
    unknown,
    ISitterBookingFormValues
  >({
    resolver: zodResolver(sitterBookingSchema),
    defaultValues: {
      petId: petOptions[0]?.value,
      type: "hourly",
      startTime: getDefaultHourlyStart().toDate(),
      endTime: getDefaultHourlyEnd().toDate(),
      ownerNotes: "",
      careInstructions: "",
    },
  });

  const serviceType = useWatch({ control, name: "type" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const previousServiceTypeRef = useRef(serviceType);

  useEffect(() => {
    if (previousServiceTypeRef.current === serviceType) {
      return;
    }

    previousServiceTypeRef.current = serviceType;

    if (serviceType === "daily") {
      setValue("startTime", getDefaultDailyStart().toDate(), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("endTime", getDefaultDailyEnd().toDate(), {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue("startTime", getDefaultHourlyStart().toDate(), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endTime", getDefaultHourlyEnd().toDate(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [serviceType, setValue]);

  useEffect(() => {
    if (!startTime || !endTime) {
      return;
    }

    if (serviceType === "daily") {
      const minimumStart = getDefaultDailyStart();
      const selectedStart = dayjs(startTime).startOf("day");
      const selectedEnd = dayjs(endTime).startOf("day");
      const safeStart = selectedStart.isBefore(minimumStart)
        ? minimumStart
        : selectedStart;

      if (!safeStart.isSame(selectedStart)) {
        setValue("startTime", safeStart.toDate(), {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (selectedEnd.isBefore(safeStart)) {
        setValue("endTime", safeStart.endOf("day").toDate(), {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    if (!dayjs(endTime).isAfter(dayjs(startTime))) {
      setValue("endTime", dayjs(startTime).add(1, "hour").toDate(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [endTime, serviceType, setValue, startTime]);

  const estimate = useMemo(
    () =>
      getBookingEstimate({
        dailyRate: sitter.dailyRate,
        endTime,
        hourlyRate: sitter.hourlyRate,
        startTime,
        type: serviceType,
      }),
    [endTime, serviceType, sitter.dailyRate, sitter.hourlyRate, startTime],
  );

  const dailyMinimumDate = useMemo(() => getDefaultDailyStart().toDate(), []);
  const startMinimumDate =
    serviceType === "daily" ? dailyMinimumDate : new Date();
  const endMinimumDate =
    serviceType === "daily"
      ? dayjs(startTime ?? dailyMinimumDate)
          .startOf("day")
          .toDate()
      : dayjs(startTime ?? new Date())
          .add(1, "minute")
          .toDate();

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
    <View className="gap-16 px-16">
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
        minimumDate={startMinimumDate}
      />
      <DateTimePickerController<
        ISitterBookingFormInput,
        ISitterBookingFormValues
      >
        control={control}
        name="endTime"
        label={serviceType === "daily" ? "End date" : "End time"}
        mode={serviceType === "daily" ? "date" : "datetime"}
        minimumDate={endMinimumDate}
      />
      <View className="gap-6 rounded-20 border border-line-subtle bg-background-surface px-14 py-12">
        <View className="flex-row items-start justify-between gap-12">
          <View className="flex-1">
            <Body variant="body4" className="text-text-muted">
              Estimated total
            </Body>
            <Body variant="body3" weight="semiBold">
              {estimate ? estimate.summary : "Select a valid care time"}
            </Body>
          </View>
          <Heading variant="h6" weight="bold">
            {estimate ? formatRate(estimate.total) : "—"}
          </Heading>
        </View>
        {estimate ? (
          <Body variant="body4" className="text-text-muted">
            {estimate.range}
          </Body>
        ) : null}
      </View>
      <BottomSheetInputController
        control={control}
        name="careInstructions"
        label="Care instructions"
        placeholder="Food, medicine, walks, or routines"
        multiline
        numberOfLines={3}
      />
      <BottomSheetInputController
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
        <BottomSheetInputController
          control={control}
          name="displayName"
          label="Display name"
          placeholder="How owners will see you"
        />
        <BottomSheetInputController
          control={control}
          name="bio"
          label="Bio"
          placeholder="Share your pet-care experience"
          multiline
          numberOfLines={3}
        />
        <BottomSheetInputController
          control={control}
          name="experience"
          label="Experience"
          placeholder="3 years caring for dogs and cats"
        />
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>Service area</SectionLabel>
        <BottomSheetInputController
          control={control}
          name="address"
          label="Service area"
          placeholder="District, city, or neighborhood"
        />
        <View className="flex-row gap-12">
          <BottomSheetInputController
            control={control}
            name="city"
            label="City"
            placeholder="Da Nang"
            className="flex-1"
          />
          <BottomSheetInputController
            control={control}
            name="district"
            label="District"
            placeholder="Hai Chau"
            className="flex-1"
          />
        </View>
        <BottomSheetInputController
          control={control}
          name="ward"
          label="Ward"
          placeholder="Optional"
        />
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>Services</SectionLabel>
        <View className="flex-row gap-12">
          <BottomSheetInputController
            control={control}
            name="hourlyRate"
            label="Hourly rate"
            keyboardType="numeric"
            placeholder="100000"
            className="flex-1"
          />
          <BottomSheetInputController
            control={control}
            name="dailyRate"
            label="Daily rate"
            keyboardType="numeric"
            placeholder="700000"
            className="flex-1"
          />
        </View>
        <BottomSheetInputController
          control={control}
          name="maxConcurrentBookings"
          label="Max bookings"
          keyboardType="numeric"
          placeholder="1"
        />
        <BottomSheetInputController
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
    <View className="gap-16 px-16">
      <BottomSheetInputController
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
    <View className="gap-16 px-16">
      <OptionInputController<ISitterReviewFormValues>
        control={control}
        name="rating"
        label="Rating"
        options={RATING_OPTIONS}
      />
      <BottomSheetInputController
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
