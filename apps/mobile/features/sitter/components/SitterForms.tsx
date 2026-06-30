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
import { resolveVietnamProvinceCityName } from "@/constants/vietnam-location-options";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { IPet, IPetSitter, ISitterBookingForm } from "@/interfaces";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { TFunction } from "i18next";
import { useEffect, useMemo, useRef } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { getRatingOptions, getServiceTypeOptions } from "../constants";
import {
  createIdempotencyKey,
  formatRate,
  getLocationLine,
  getSitterName,
} from "../utils";
import { SectionLabel } from "./SitterPrimitives";
import { VietnamProvinceCitySelect } from "./VietnamProvinceCitySelect";

const BottomSheetInputController =
  withBottomSheetKeyboardEvents(InputController);
const ProfileInputController = InputController;
const RequestInputController = InputController;

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
  t,
}: {
  dailyRate: string | number;
  endTime?: Date;
  hourlyRate: string | number;
  startTime?: Date;
  type?: "hourly" | "daily";
  t: TFunction;
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
      summary: t("sitter.estimate.dailySummary", {
        count: days,
        rate: formatRate(rate),
      }),
      range: `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`,
    };
  }

  const hours = diffMs / HOUR_MS;
  const normalizedHours = Number(hours.toFixed(2));
  const rate = getNumberRate(hourlyRate);

  return {
    total: rate * normalizedHours,
    summary: t("sitter.estimate.hourlySummary", {
      count: normalizedHours,
      rate: formatRate(rate),
    }),
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
  const { t } = useTranslation();
  const petOptions = useMemo(
    () => pets.map((pet) => ({ label: pet.name, value: pet.id })),
    [pets],
  );
  const serviceTypeOptions = getServiceTypeOptions();

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
  const isSubmittingRef = useRef(false);

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
        t,
      }),
    [endTime, serviceType, sitter.dailyRate, sitter.hourlyRate, startTime, t],
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

  const submit = async (data: ISitterBookingFormValues) => {
    if (loading || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    const isDaily = data.type === "daily";
    const startTime = isDaily
      ? dayjs(data.startTime).startOf("day").toISOString()
      : data.startTime.toISOString();
    const endTime = isDaily
      ? dayjs(data.endTime).endOf("day").toISOString()
      : data.endTime.toISOString();

    try {
      await onSubmit({
        idempotencyKey: createIdempotencyKey(),
        petId: data.petId,
        type: data.type,
        sitterId: sitter.id,
        startTime,
        endTime,
        ownerNotes: data.ownerNotes,
        careInstructions: data.careInstructions,
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (!pets.length) {
    return (
      <StateView
        variant="empty"
        title={t("sitter.form.addPetTitle")}
        description={t("sitter.form.addPetDescription")}
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
        label={t("sitter.form.pet")}
        options={petOptions}
      />
      <OptionInputController<ISitterBookingFormInput, ISitterBookingFormValues>
        control={control}
        name="type"
        label={t("sitter.form.serviceType")}
        options={serviceTypeOptions}
      />
      <DateTimePickerController<
        ISitterBookingFormInput,
        ISitterBookingFormValues
      >
        control={control}
        name="startTime"
        label={
          serviceType === "daily"
            ? t("sitter.form.startDate")
            : t("sitter.form.startTime")
        }
        mode={serviceType === "daily" ? "date" : "datetime"}
        minimumDate={startMinimumDate}
      />
      <DateTimePickerController<
        ISitterBookingFormInput,
        ISitterBookingFormValues
      >
        control={control}
        name="endTime"
        label={
          serviceType === "daily"
            ? t("sitter.form.endDate")
            : t("sitter.form.endTime")
        }
        mode={serviceType === "daily" ? "date" : "datetime"}
        minimumDate={endMinimumDate}
      />
      <View className="gap-6 rounded-20 border border-line-subtle bg-background-surface px-14 py-12">
        <View className="flex-row items-start justify-between gap-12">
          <View className="flex-1">
            <Body variant="body4" className="text-text-muted">
              {t("sitter.estimate.total")}
            </Body>
            <Body variant="body3" weight="semiBold">
              {estimate ? estimate.summary : t("sitter.estimate.validTime")}
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
      <RequestInputController
        control={control}
        name="careInstructions"
        label={t("sitter.form.careInstructions")}
        placeholder={t("sitter.form.careInstructionsPlaceholder")}
        multiline
        numberOfLines={3}
      />
      <RequestInputController
        control={control}
        name="ownerNotes"
        label={t("sitter.form.ownerNotes")}
        placeholder={t("sitter.form.ownerNotesPlaceholder")}
        multiline
        numberOfLines={3}
      />
      <Button
        loading={loading}
        disabled={loading}
        onPress={() => handleSubmit(submit)()}
      >
        {t("sitter.form.sendBookingRequest")}
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
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<
    ISitterProfileFormInput,
    unknown,
    ISitterProfileForm
  >({
    resolver: zodResolver(sitterProfileSchema),
    defaultValues: {
      displayName: defaultValues?.displayName ?? "",
      city:
        resolveVietnamProvinceCityName(defaultValues?.city) ??
        defaultValues?.city ??
        "",
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
  const {
    field: { value: city, onChange: setCity },
    fieldState: { error: cityError },
  } = useController({
    control,
    name: "city",
  });

  return (
    <View className="gap-18 px-16">
      {defaultValues ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={t("sitter.form.acceptRequests")}
          accessibilityState={{ checked: Boolean(isAvailable) }}
          onPress={() => setIsAvailable(!isAvailable)}
          className="flex-row items-center justify-between gap-16 rounded-22 border border-line-subtle bg-background-surface px-16 py-14"
        >
          <View className="flex-1">
            <Body variant="body3" weight="semiBold">
              {t("sitter.form.acceptRequests")}
            </Body>
            <Body variant="body4" className="text-text-muted">
              {t("sitter.form.pauseDescription")}
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
        <SectionLabel>{t("sitter.form.profile")}</SectionLabel>
        <ProfileInputController
          control={control}
          name="displayName"
          label={t("sitter.form.displayName")}
          placeholder={t("sitter.form.displayNamePlaceholder")}
        />
        <ProfileInputController
          control={control}
          name="bio"
          label={t("sitter.form.bio")}
          placeholder={t("sitter.form.bioPlaceholder")}
          multiline
          numberOfLines={3}
        />
        <ProfileInputController
          control={control}
          name="experience"
          label={t("sitter.form.experience")}
          placeholder={t("sitter.form.experiencePlaceholder")}
        />
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <VietnamProvinceCitySelect
          value={city}
          onChange={setCity}
          emptyLabel={t("sitter.form.cityEmpty")}
          clearLabel={t("sitter.form.cityClear")}
          errorMessage={cityError?.message}
        />
        <View className="flex-row gap-12">
          <ProfileInputController
            control={control}
            name="district"
            label={t("sitter.form.district")}
            placeholder={t("sitter.form.districtPlaceholder")}
            className="flex-1"
          />
          <ProfileInputController
            control={control}
            name="ward"
            label={t("sitter.form.ward")}
            placeholder={t("sitter.form.wardPlaceholder")}
            className="flex-1"
          />
        </View>
      </View>

      <View className="gap-14 rounded-24 border border-line-subtle bg-background-surface px-14 py-14">
        <SectionLabel>{t("sitter.form.services")}</SectionLabel>
        <View className="flex-row gap-12">
          <ProfileInputController
            control={control}
            name="hourlyRate"
            label={t("sitter.form.hourlyRate")}
            keyboardType="numeric"
            placeholder="100000"
            className="flex-1"
          />
          <ProfileInputController
            control={control}
            name="dailyRate"
            label={t("sitter.form.dailyRate")}
            keyboardType="numeric"
            placeholder="700000"
            className="flex-1"
          />
        </View>
        <ProfileInputController
          control={control}
          name="maxConcurrentBookings"
          label={t("sitter.form.maxBookings")}
          keyboardType="numeric"
          placeholder="1"
        />
        <ProfileInputController
          control={control}
          name="serviceNotes"
          label={t("sitter.form.serviceNotes")}
          placeholder={t("sitter.form.serviceNotesPlaceholder")}
          multiline
          numberOfLines={3}
        />
      </View>

      <Button
        wrapperClassName="mx-14"
        loading={loading}
        onPress={() => handleSubmit(onSubmit)()}
      >
        {defaultValues
          ? t("sitter.form.saveProfile")
          : t("sitter.form.createProfile")}
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
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<ISitterCancelForm>({
    resolver: zodResolver(sitterCancelSchema),
    defaultValues: { reason: "" },
  });

  return (
    <View className="gap-16 px-16">
      <BottomSheetInputController
        control={control}
        name="reason"
        label={t("sitter.form.reason")}
        placeholder={t("sitter.form.reasonPlaceholder")}
        multiline
        numberOfLines={3}
      />
      <Button
        variant="destructive"
        loading={loading}
        onPress={() => handleSubmit(onSubmit)()}
      >
        {t("sitter.form.cancelBooking")}
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
  const { t } = useTranslation();
  const ratingOptions = getRatingOptions();
  const { control, handleSubmit } = useForm<ISitterReviewFormValues>({
    resolver: zodResolver(sitterReviewSchema),
    defaultValues: { rating: "5", comment: "" },
  });

  return (
    <View className="gap-16 px-16">
      <OptionInputController<ISitterReviewFormValues>
        control={control}
        name="rating"
        label={t("sitter.form.rating")}
        options={ratingOptions}
      />
      <BottomSheetInputController
        control={control}
        name="comment"
        label={t("sitter.form.comment")}
        placeholder={t("sitter.form.commentPlaceholder")}
        multiline
        numberOfLines={4}
      />
      <Button loading={loading} onPress={() => handleSubmit(onSubmit)()}>
        {t("sitter.form.submitReview")}
      </Button>
    </View>
  );
};
