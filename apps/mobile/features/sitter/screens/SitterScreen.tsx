import { Skeleton } from "@/components/Skeleton";
import { Tabs } from "@/components/Tabs";
import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { Toast } from "@/components/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import {
  ISitterBookingFormValues,
  ISitterCancelForm,
  ISitterMessageForm,
  ISitterProfileForm,
  ISitterProfileFormInput,
  ISitterReviewFormValues,
  sitterBookingSchema,
  sitterCancelSchema,
  sitterMessageSchema,
  sitterProfileSchema,
  sitterReviewSchema,
} from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  IPet,
  IPetSitter,
  ISitterBooking,
  ISitterBookingForm,
  ISitterReview,
  SitterBookingStatus,
} from "@/interfaces";
import { cn, formatCurrency } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import dayjs from "dayjs";
import {
  CalendarCheckIcon,
  ClockIcon,
  SlidersHorizontalIcon,
  PencilSimpleIcon,
  StarIcon,
} from "phosphor-react-native";
import { memo, useCallback, useMemo, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { Alert, Pressable, View } from "react-native";
import {
  useSitterBookingMessages,
  SitterFilters,
  useSitterReviews,
  useSitters,
} from "@/features/sitter/useSitters";

const CalendarCheck = withIconClassName(CalendarCheckIcon);
const Clock = withIconClassName(ClockIcon);
const PencilSimple = withIconClassName(PencilSimpleIcon);
const SlidersHorizontal = withIconClassName(SlidersHorizontalIcon);
const Star = withIconClassName(StarIcon);

const SCREEN_TABS = [
  { title: "Find care", value: 0 },
  { title: "Bookings", value: 1 },
];

const BOOKING_ROLE_TABS = [
  { title: "Owner", value: 0 },
  { title: "Sitter", value: 1 },
];

const SERVICE_TYPE_OPTIONS = [
  { label: "Hourly care", value: "hourly" },
  { label: "Daily care", value: "daily" },
];

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((rating) => ({
  label: `${rating} star${rating > 1 ? "s" : ""}`,
  value: String(rating),
}));

const STATUS_COPY: Record<SitterBookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const statusClassName: Record<SitterBookingStatus, string> = {
  pending: "bg-background-card-highlight",
  confirmed: "bg-background-secondary-highlight",
  active: "bg-background-primary",
  completed: "bg-background-secondary-highlight",
  cancelled: "bg-background-negative-foreground",
  rejected: "bg-background-negative-foreground",
};

const SITTER_SKELETON_ITEMS = [0, 1, 2, 3];

const formatRate = (value: string | number) =>
  formatCurrency(Number(value || 0), "₫", "vi-VN");

const formatDateTime = (value: string) => dayjs(value).format("DD MMM, HH:mm");

const getSitterName = (sitter: IPetSitter) => {
  const accountName = [sitter.account?.firstName, sitter.account?.lastName]
    .filter(Boolean)
    .join(" ");

  return sitter.displayName || accountName || "Pet sitter";
};

const getBookingTitle = (booking: ISitterBooking, role: "owner" | "sitter") => {
  if (role === "owner") {
    return booking.sitter ? getSitterName(booking.sitter) : "Sitter booking";
  }

  return "Owner request";
};

const createIdempotencyKey = () =>
  `mobile-sitter-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const hasFilters = (filters: SitterFilters) =>
  Boolean(filters.city || filters.district || filters.minRating || filters.maxPrice);

const normalizeFilters = (filters: SitterFilters): SitterFilters | null => {
  const next: SitterFilters = {
    city: filters.city?.trim() || undefined,
    district: filters.district?.trim() || undefined,
    minRating: filters.minRating?.trim() || undefined,
    maxPrice: filters.maxPrice?.trim() || undefined,
  };

  if (next.minRating) {
    const minRating = Number(next.minRating);
    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 5) {
      Toast.error({ text: "Minimum rating must be between 0 and 5." });
      return null;
    }
  }

  if (next.maxPrice) {
    const maxPrice = Number(next.maxPrice);
    if (!Number.isFinite(maxPrice) || maxPrice < 0) {
      Toast.error({ text: "Max price must be a valid positive number." });
      return null;
    }
  }

  return next;
};

const ExternalPaymentNotice = () => (
  <View className="rounded-20 bg-background-card-highlight px-16 py-14">
    <Body variant="body3" weight="semiBold">
      Payment is arranged directly
    </Body>
    <Body variant="body4" className="mt-4 text-text-muted">
      Payment and final service details are arranged directly between pet owner
      and sitter.
    </Body>
  </View>
);

const SitterProfileStatus = ({
  profile,
  onEdit,
}: {
  profile: IPetSitter;
  onEdit: () => void;
}) => (
  <View className="mb-16 gap-12 rounded-20 bg-background-card px-16 py-16">
    <View className="flex-row items-start justify-between gap-12">
      <View className="flex-1">
        <Body variant="body5" caps className="text-text-muted">
          Your sitter profile
        </Body>
        <Heading variant="h6" weight="bold" numberOfLines={1}>
          {profile.isAvailable ? "Available for requests" : "Paused"}
        </Heading>
        <Body variant="body3" className="text-text-muted">
          {profile.address}
        </Body>
      </View>
      <Button size="sm" variant="outline" onPress={onEdit}>
        Edit
      </Button>
    </View>
    <Body variant="body4" className="text-text-muted">
      {profile.isAvailable
        ? "Owners can discover your profile and send booking requests."
        : "Your profile is hidden from discovery until you become available again."}
    </Body>
  </View>
);

const getReviewerName = (review: ISitterReview) => {
  const name = [review.user?.firstName, review.user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Pet owner";
};

const RecentSitterReviews = ({ sitter }: { sitter: IPetSitter }) => {
  const reviewsQuery = useSitterReviews(sitter.id);
  const reviews = reviewsQuery.data?.data ?? [];

  return (
    <View className="gap-12">
      <View className="flex-row items-center justify-between gap-12">
        <Heading variant="h6" weight="bold">
          Recent reviews
        </Heading>
        <Body variant="body4" className="text-text-muted">
          {sitter.totalReviews || 0} total
        </Body>
      </View>

      {reviewsQuery.isLoading ? (
        <View className="gap-10">
          <Skeleton
            className="h-74 rounded-16"
            backgroundClassName="bg-background-primary"
          />
          <Skeleton
            className="h-74 rounded-16"
            backgroundClassName="bg-background-primary"
          />
        </View>
      ) : reviewsQuery.isError ? (
        <StateView
          variant="error"
          title="Reviews could not load"
          description="Try again to refresh sitter reviews."
          actionLabel="Retry"
          onAction={() => reviewsQuery.refetch()}
          className="min-h-140"
        />
      ) : reviews.length ? (
        <View className="gap-10">
          {reviews.map((review) => (
            <View
              key={review.id}
              className="gap-6 rounded-16 bg-background-card-highlight px-12 py-12"
            >
              <View className="flex-row items-center justify-between gap-12">
                <Body variant="body3" weight="semiBold" numberOfLines={1}>
                  {getReviewerName(review)}
                </Body>
                <View className="flex-row items-center gap-4">
                  <Star size={14} weight="fill" className="text-status-warning-icon" />
                  <Body variant="body4" weight="semiBold">
                    {review.rating}
                  </Body>
                </View>
              </View>
              {review.comment ? (
                <Body variant="body4" className="text-text-muted">
                  {review.comment}
                </Body>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <StateView
          variant="empty"
          title="No reviews yet"
          description="Reviews will appear after completed bookings."
          className="min-h-140"
        />
      )}
    </View>
  );
};

const SitterSkeleton = () => (
  <View className="gap-16 mt-20">
    {SITTER_SKELETON_ITEMS.map((index) => (
      <Skeleton
        key={index}
        className="h-132 rounded-20"
        backgroundClassName="bg-background-primary"
      />
    ))}
  </View>
);

const SitterCard = memo(
  ({
    sitter,
    onPress,
  }: {
    sitter: IPetSitter;
    onPress: (sitter: IPetSitter) => void;
  }) => {
    const rating = Number(sitter.avgRating || 0).toFixed(1);

    return (
      <Pressable
        onPress={() => onPress(sitter)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${getSitterName(sitter)} sitter profile`}
        className="rounded-20 bg-background-card px-16 py-16"
      >
        <View className="flex-row items-center gap-12">
          <Avatar
            size="large"
            source={{
              uri: sitter.account?.avatarUrl ?? undefined,
            }}
          />
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-12">
              <Heading variant="h6" weight="bold" numberOfLines={1}>
                {getSitterName(sitter)}
              </Heading>
              <View className="flex-row items-center gap-4">
                <Star size={16} weight="fill" className="text-status-warning-icon" />
                <Body variant="body3" weight="semiBold">
                  {rating}
                </Body>
              </View>
            </View>
            <Body
              variant="body3"
              numberOfLines={1}
              className="text-text-muted"
            >
              {sitter.address}
            </Body>
          </View>
        </View>

        <View className="mt-14 flex-row gap-12">
          <View className="flex-1 rounded-14 bg-background-card-highlight px-12 py-10">
            <Body variant="body5" caps className="text-text-muted">
              Hourly
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.hourlyRate)}
            </Body>
          </View>
          <View className="flex-1 rounded-14 bg-background-card-highlight px-12 py-10">
            <Body variant="body5" caps className="text-text-muted">
              Daily
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.dailyRate)}
            </Body>
          </View>
        </View>

        <Body
          variant="body3"
          numberOfLines={2}
          className={cn("mt-14 text-text-muted", {
            "italic opacity-70": !sitter.bio,
          })}
        >
          {sitter.bio || "No sitter bio yet."}
        </Body>
      </Pressable>
    );
  },
);

SitterCard.displayName = "SitterCard";

const BookingCard = ({
  booking,
  role,
  onOpenMessages,
  onCancel,
  onAccept,
  onReject,
  onComplete,
  onReview,
  loading,
}: {
  booking: ISitterBooking;
  role: "owner" | "sitter";
  onOpenMessages: (booking: ISitterBooking) => void;
  onCancel: (booking: ISitterBooking) => void;
  onAccept: (booking: ISitterBooking) => void;
  onReject: (booking: ISitterBooking) => void;
  onComplete: (booking: ISitterBooking) => void;
  onReview: (booking: ISitterBooking) => void;
  loading: boolean;
}) => {
  const canSitterRespond = role === "sitter" && booking.status === "pending";
  const canComplete =
    role === "sitter" &&
    ["confirmed", "active"].includes(booking.status);
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const canReview = role === "owner" && booking.status === "completed";

  return (
    <View className="gap-12 rounded-20 bg-background-card px-16 py-16">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h6" weight="bold" numberOfLines={1}>
            {getBookingTitle(booking, role)}
          </Heading>
          <Body variant="body3" className="text-text-muted">
            {booking.pet?.name ?? "Pet"} • {booking.type}
          </Body>
        </View>
        <View
          className={cn(
            "rounded-full px-10 py-5",
            statusClassName[booking.status],
          )}
        >
          <Body variant="body5" weight="semiBold">
            {STATUS_COPY[booking.status]}
          </Body>
        </View>
      </View>

      <View className="gap-6">
        <View className="flex-row items-center gap-8">
          <Clock size={16} className="text-icon-secondary" />
          <Body variant="body3">
            {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
          </Body>
        </View>
        <View className="flex-row items-center gap-8">
          <CalendarCheck size={16} className="text-icon-secondary" />
          <Body variant="body3">
            Estimate: {booking.totalPrice ? formatRate(booking.totalPrice) : "to confirm"}
          </Body>
        </View>
      </View>

      <ExternalPaymentNotice />

      <View className="flex-row flex-wrap gap-8">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onOpenMessages(booking)}
        >
          Messages
        </Button>
        {canSitterRespond ? (
          <>
            <Button
              size="sm"
              loading={loading}
              onPress={() => onAccept(booking)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={loading}
              onPress={() => onReject(booking)}
            >
              Reject
            </Button>
          </>
        ) : null}
        {canComplete ? (
          <Button
            size="sm"
            loading={loading}
            onPress={() => onComplete(booking)}
          >
            Complete
          </Button>
        ) : null}
        {canReview ? (
          <Button size="sm" onPress={() => onReview(booking)}>
            Review
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            size="sm"
            variant="ghost"
            loading={loading}
            onPress={() => onCancel(booking)}
          >
            Cancel
          </Button>
        ) : null}
      </View>
    </View>
  );
};

const BookingRequestForm = ({
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

  const { control, handleSubmit } = useForm<ISitterBookingFormValues>({
    resolver: zodResolver(sitterBookingSchema),
    defaultValues: {
      petId: petOptions[0]?.value,
      type: "hourly",
      startTime: dayjs().add(1, "hour").toDate(),
      endTime: dayjs().add(2, "hour").toDate(),
    },
  });

  const submit = (data: ISitterBookingFormValues) =>
    onSubmit({
      idempotencyKey: createIdempotencyKey(),
      petId: data.petId,
      type: data.type,
      sitterId: sitter.id,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
    });

  if (!pets.length) {
    return (
      <StateView
        variant="empty"
        title="Add a pet first"
        description="Create a pet profile before requesting sitter care."
        className="min-h-140"
      />
    );
  }

  return (
    <View className="gap-16">
      <ExternalPaymentNotice />
      <OptionInputController<ISitterBookingFormValues>
        control={control}
        name="petId"
        label="Pet"
        options={petOptions}
      />
      <OptionInputController<ISitterBookingFormValues>
        control={control}
        name="type"
        label="Service type"
        options={SERVICE_TYPE_OPTIONS}
      />
      <DateTimePickerController<ISitterBookingFormValues>
        control={control}
        name="startTime"
        label="Start time"
        mode="datetime"
        minimumDate={new Date()}
      />
      <DateTimePickerController<ISitterBookingFormValues>
        control={control}
        name="endTime"
        label="End time"
        mode="datetime"
        minimumDate={new Date()}
      />
      <Button loading={loading} onPress={() => handleSubmit(submit)()}>
        Send booking request
      </Button>
    </View>
  );
};

const SitterFilterSheet = ({
  value,
  onApply,
  onClear,
}: {
  value: SitterFilters;
  onApply: (filters: SitterFilters) => void;
  onClear: () => void;
}) => {
  const [city, setCity] = useState(value.city ?? "");
  const [district, setDistrict] = useState(value.district ?? "");
  const [minRating, setMinRating] = useState(value.minRating ?? "");
  const [maxPrice, setMaxPrice] = useState(value.maxPrice ?? "");

  const handleApply = () => {
    const filters = normalizeFilters({
      city,
      district,
      minRating,
      maxPrice,
    });

    if (!filters) return;

    onApply(filters);
  };

  return (
    <View className="gap-16">
      <InputField
        label="City"
        placeholder="Ho Chi Minh City"
        value={city}
        onChangeText={setCity}
      />
      <InputField
        label="District"
        placeholder="District 1"
        value={district}
        onChangeText={setDistrict}
      />
      <InputField
        label="Minimum rating"
        placeholder="4"
        keyboardType="numeric"
        value={minRating}
        onChangeText={setMinRating}
      />
      <InputField
        label="Max price"
        placeholder="500000"
        keyboardType="numeric"
        value={maxPrice}
        onChangeText={setMaxPrice}
      />
      <View className="flex-row gap-12">
        <Button className="flex-1" variant="outline" onPress={onClear}>
          Clear
        </Button>
        <Button className="flex-1" onPress={handleApply}>
          Apply filters
        </Button>
      </View>
    </View>
  );
};

const SitterProfileForm = ({
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
      address: defaultValues?.address ?? "",
      bio: defaultValues?.bio ?? "",
      hourlyRate: String(defaultValues?.hourlyRate ?? ""),
      dailyRate: String(defaultValues?.dailyRate ?? ""),
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
    <View className="gap-16">
      {defaultValues ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Sitter availability"
          accessibilityState={{ checked: Boolean(isAvailable) }}
          onPress={() => setIsAvailable(!isAvailable)}
          className="flex-row items-center justify-between gap-16 rounded-18 bg-background-card-highlight px-16 py-14"
        >
          <View className="flex-1">
            <Body variant="body3" weight="semiBold">
              Accept new requests
            </Body>
            <Body variant="body4" className="text-text-muted">
              Turn this off to pause your sitter profile in discovery.
            </Body>
          </View>
          <View
            className={cn(
              "h-32 w-56 justify-center rounded-full p-3",
              isAvailable ? "bg-background-primary" : "bg-background-tertiary",
            )}
          >
            <View
              className={cn(
                "h-26 w-26 rounded-full bg-background-card shadow-card",
                isAvailable && "translate-x-24",
              )}
            />
          </View>
        </Pressable>
      ) : null}
      <InputController<ISitterProfileFormInput, ISitterProfileForm>
        control={control}
        name="address"
        label="Service area"
        placeholder="District, city, or neighborhood"
      />
      <InputController<ISitterProfileFormInput, ISitterProfileForm>
        control={control}
        name="hourlyRate"
        label="Hourly rate"
        keyboardType="numeric"
        placeholder="100000"
      />
      <InputController<ISitterProfileFormInput, ISitterProfileForm>
        control={control}
        name="dailyRate"
        label="Daily rate"
        keyboardType="numeric"
        placeholder="700000"
      />
      <InputController<ISitterProfileFormInput, ISitterProfileForm>
        control={control}
        name="bio"
        label="Bio (optional)"
        placeholder="Share your pet-care experience"
        multiline
        numberOfLines={4}
      />
      <Button loading={loading} onPress={() => handleSubmit(onSubmit)()}>
        Save sitter profile
      </Button>
    </View>
  );
};

const CancelForm = ({
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
      <Button loading={loading} onPress={() => handleSubmit(onSubmit)()}>
        Cancel booking
      </Button>
    </View>
  );
};

const ReviewForm = ({
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

const MessageThread = ({
  booking,
  onSend,
  loading,
}: {
  booking: ISitterBooking;
  onSend: (data: ISitterMessageForm) => Promise<void>;
  loading: boolean;
}) => {
  const messagesQuery = useSitterBookingMessages(booking.id);
  const { control, handleSubmit, reset } = useForm<ISitterMessageForm>({
    resolver: zodResolver(sitterMessageSchema),
    defaultValues: { content: "" },
  });

  const messages = messagesQuery.data?.data ?? [];

  const submit = async (data: ISitterMessageForm) => {
    await onSend(data);
    reset({ content: "" });
  };

  return (
    <View className="gap-16">
      <ExternalPaymentNotice />
      {messagesQuery.isLoading ? (
        <SitterSkeleton />
      ) : messagesQuery.isError ? (
        <StateView
          variant="error"
          title="Messages could not load"
          description="Try again to refresh this booking thread."
          actionLabel="Retry"
          onAction={() => messagesQuery.refetch()}
          className="min-h-140"
        />
      ) : messages.length ? (
        <View className="gap-10">
          {messages.map((message) => (
            <View
              key={message.id}
              className="rounded-16 bg-background-card-highlight px-12 py-10"
            >
              <Body variant="body4" className="text-text-muted">
                {message.createdAt ? dayjs(message.createdAt).format("DD MMM, HH:mm") : "Just now"}
              </Body>
              <Body variant="body3">{message.content}</Body>
            </View>
          ))}
        </View>
      ) : (
        <StateView
          variant="empty"
          title="No messages yet"
          description="Use this thread to confirm care details before the visit."
          className="min-h-140"
        />
      )}

      <InputController<ISitterMessageForm>
        control={control}
        name="content"
        label="Message"
        placeholder="Ask or share care details"
        multiline
        numberOfLines={3}
      />
      <Button loading={loading} onPress={() => handleSubmit(submit)()}>
        Send message
      </Button>
    </View>
  );
};

export const SitterScreen = () => {
  const [activeTab, setActiveTab] = useState(SCREEN_TABS[0].value);
  const [bookingRoleTab, setBookingRoleTab] = useState(BOOKING_ROLE_TABS[0].value);
  const [filters, setFilters] = useState<SitterFilters>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<IPetSitter | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [bookingForMessages, setBookingForMessages] =
    useState<ISitterBooking | null>(null);
  const [bookingForCancel, setBookingForCancel] =
    useState<ISitterBooking | null>(null);
  const [bookingForReview, setBookingForReview] =
    useState<ISitterBooking | null>(null);

  const {
    sitters,
    pets,
    mySitterProfile,
    ownerBookings,
    sitterBookings,
    isLoading,
    isError,
    isOwnerBookingsLoading,
    isSitterBookingsLoading,
    isOwnerBookingsError,
    isSitterBookingsError,
    hasSitterProfile,
    isRefreshing,
    refetch,
    refetchAll,
    createBooking,
    saveProfile,
    acceptBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    sendMessage,
    createReview,
    isCreatingBooking,
    isSavingProfile,
    isMutatingBooking,
    isSendingMessage,
    isCreatingReview,
  } = useSitters(filters);

  const activeBookings = bookingRoleTab === 0 ? ownerBookings : sitterBookings;
  const activeBookingRole = bookingRoleTab === 0 ? "owner" : "sitter";
  const hasActiveFilters = hasFilters(filters);
  const isActiveBookingsLoading =
    bookingRoleTab === 0 ? isOwnerBookingsLoading : isSitterBookingsLoading;
  const isActiveBookingsError =
    bookingRoleTab === 0 ? isOwnerBookingsError : isSitterBookingsError;

  const renderSitter = useCallback<ListRenderItem<IPetSitter>>(
    ({ item }) => <SitterCard sitter={item} onPress={setSelectedSitter} />,
    [],
  );

  const renderBooking = useCallback<ListRenderItem<ISitterBooking>>(
    ({ item }) => (
      <BookingCard
        booking={item}
        role={activeBookingRole}
        loading={isMutatingBooking}
        onOpenMessages={setBookingForMessages}
        onCancel={setBookingForCancel}
        onReview={setBookingForReview}
        onAccept={(booking) => acceptBooking(booking.id)}
        onComplete={(booking) => completeBooking(booking.id)}
        onReject={(booking) => {
          Alert.alert("Reject booking?", "This will let the owner know you cannot take this request.", [
            { text: "Keep", style: "cancel" },
            {
              text: "Reject",
              style: "destructive",
              onPress: () => {
                void rejectBooking(booking.id);
              },
            },
          ]);
        }}
      />
    ),
    [
      acceptBooking,
      activeBookingRole,
      completeBooking,
      isMutatingBooking,
      rejectBooking,
    ],
  );

  const handleCreateBooking = async (data: ISitterBookingForm) => {
    await createBooking(data);
    setSelectedSitter(null);
    setActiveTab(1);
  };

  const handleCancelBooking = async (data: ISitterCancelForm) => {
    if (!bookingForCancel) return;

    await cancelBooking({ id: bookingForCancel.id, reason: data.reason });
    setBookingForCancel(null);
  };

  const handleCreateReview = async (data: ISitterReviewFormValues) => {
    if (!bookingForReview) return;

    await createReview({
      bookingId: bookingForReview.id,
      sitterId: bookingForReview.sitterId,
      rating: Number(data.rating) as 1 | 2 | 3 | 4 | 5,
      comment: data.comment,
    });
    setBookingForReview(null);
  };

  const handleSendMessage = async (data: ISitterMessageForm) => {
    if (!bookingForMessages) return;

    await sendMessage({
      bookingId: bookingForMessages.id,
      type: "text",
      content: data.content,
    });
  };

  return (
    <ScreenContainer>
      <View className="pt-safe-offset-20 pb-16 gap-4">
        <View className="flex-row items-start justify-between gap-12">
          <View className="flex-1">
            <Heading variant="h4" weight="bold">
              Sitter
            </Heading>
            <Body variant="body3" className="text-text-muted">
              Find trusted care and manage booking requests.
            </Body>
          </View>
          <View className="flex-row gap-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter sitters"
              accessibilityState={{ selected: hasActiveFilters }}
              onPress={() => setFilterSheetOpen(true)}
              className={cn(
                "h-44 w-44 items-center justify-center rounded-full bg-background-card",
                hasActiveFilters && "bg-background-primary",
              )}
            >
              <SlidersHorizontal
                size={20}
                className={
                  hasActiveFilters
                    ? "text-icon-primary-inverse"
                    : "text-icon-primary"
                }
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                mySitterProfile ? "Edit sitter profile" : "Create sitter profile"
              }
              onPress={() => setProfileFormOpen(true)}
              className="h-44 w-44 items-center justify-center rounded-full bg-background-card"
            >
              <PencilSimple size={20} className="text-icon-primary" />
            </Pressable>
          </View>
        </View>
        {hasActiveFilters ? (
          <Body variant="body4" className="text-text-muted">
            Filtered by{" "}
            {[filters.city, filters.district, filters.minRating && `${filters.minRating}+ stars`, filters.maxPrice && `under ${formatRate(filters.maxPrice)}`]
              .filter(Boolean)
              .join(", ")}
          </Body>
        ) : null}
      </View>

      <Tabs
        tabs={SCREEN_TABS}
        active={activeTab}
        onChange={setActiveTab}
        size="large"
        className="mb-16 self-center"
      />

      {activeTab === 0 ? (
        <FlashList
          data={sitters}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-16 pb-safe"
          estimatedItemSize={196}
          showsVerticalScrollIndicator={false}
          renderItem={renderSitter}
          refreshing={isRefreshing}
          onRefresh={refetchAll}
          ListEmptyComponent={() => {
            if (isLoading) {
              return <SitterSkeleton />;
            }

            if (isError) {
              return (
                <StateView
                  variant="error"
                  title="Could not load sitters"
                  description="Check your connection and try again."
                  actionLabel="Try again"
                  onAction={() => refetch()}
                />
              );
            }

            return (
              <StateView
                variant="empty"
                title="No sitters available"
                description="Available pet sitters will appear here."
              />
            );
          }}
        />
      ) : (
        <View className="flex-1">
          {mySitterProfile ? (
            <SitterProfileStatus
              profile={mySitterProfile}
              onEdit={() => setProfileFormOpen(true)}
            />
          ) : null}
          <Tabs
            tabs={BOOKING_ROLE_TABS}
            active={bookingRoleTab}
            onChange={setBookingRoleTab}
            className="mb-16 self-center"
          />
          <FlashList
            data={activeBookings}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-16 pb-safe"
            estimatedItemSize={236}
            showsVerticalScrollIndicator={false}
            renderItem={renderBooking}
            refreshing={isRefreshing}
            onRefresh={refetchAll}
            ListHeaderComponent={
              <View className="mb-12">
                <ExternalPaymentNotice />
              </View>
            }
            ListEmptyComponent={() => {
              if (isActiveBookingsLoading) {
                return <SitterSkeleton />;
              }

              if (isActiveBookingsError) {
                return (
                  <StateView
                    variant="error"
                    title="Bookings could not load"
                    description="Try again to refresh your sitter bookings."
                    actionLabel="Retry"
                    onAction={refetchAll}
                  />
                );
              }

              if (activeBookingRole === "sitter" && !hasSitterProfile) {
                return (
                  <StateView
                    variant="empty"
                    title="Create your sitter profile"
                    description="Add your service area and rates before receiving requests. You can add a care bio anytime."
                    actionLabel="Become a sitter"
                    onAction={() => setProfileFormOpen(true)}
                  />
                );
              }

              return (
                <StateView
                  variant="empty"
                  title="No bookings yet"
                  description={
                    activeBookingRole === "owner"
                      ? "Requests you send to sitters will appear here."
                      : "Requests from pet owners will appear here after your sitter profile is active."
                  }
                />
              );
            }}
          />
        </View>
      )}

      <BottomSheet
        visible={filterSheetOpen}
        onDismiss={() => setFilterSheetOpen(false)}
        titleElement={<Body weight="semiBold">Filter sitters</Body>}
        useScrollView
      >
        <SitterFilterSheet
          value={filters}
          onClear={() => {
            setFilters({});
            setFilterSheetOpen(false);
          }}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setFilterSheetOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={!!selectedSitter}
        onDismiss={() => setSelectedSitter(null)}
        titleElement={<Body weight="semiBold">Sitter profile</Body>}
        useScrollView
      >
        {selectedSitter ? (
          <View className="gap-18">
            <View className="flex-row items-center gap-12">
              <Avatar
                size="large"
                source={{ uri: selectedSitter.account?.avatarUrl ?? undefined }}
              />
              <View className="flex-1">
                <Heading variant="h5" weight="bold">
                  {getSitterName(selectedSitter)}
                </Heading>
                <Body variant="body3" className="text-text-muted">
                  {selectedSitter.address}
                </Body>
              </View>
            </View>
            <ExternalPaymentNotice />
            <Body variant="body3" className="text-text-muted">
              {selectedSitter.bio || "This sitter has not added a bio yet."}
            </Body>
            <RecentSitterReviews sitter={selectedSitter} />
            <BookingRequestForm
              sitter={selectedSitter}
              pets={pets}
              onSubmit={handleCreateBooking}
              loading={isCreatingBooking}
            />
          </View>
        ) : null}
      </BottomSheet>

      <BottomSheet
        visible={profileFormOpen}
        onDismiss={() => setProfileFormOpen(false)}
        titleElement={
          <Body weight="semiBold">
            {mySitterProfile ? "Edit sitter profile" : "Become a sitter"}
          </Body>
        }
        useScrollView
      >
        <SitterProfileForm
          defaultValues={mySitterProfile}
          loading={isSavingProfile}
          onSubmit={async (data) => {
            await saveProfile(data);
            setProfileFormOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={!!bookingForMessages}
        onDismiss={() => setBookingForMessages(null)}
        titleElement={<Body weight="semiBold">Booking messages</Body>}
        useScrollView
      >
        {bookingForMessages ? (
          <MessageThread
            booking={bookingForMessages}
            loading={isSendingMessage}
            onSend={handleSendMessage}
          />
        ) : null}
      </BottomSheet>

      <BottomSheet
        visible={!!bookingForCancel}
        onDismiss={() => setBookingForCancel(null)}
        titleElement={<Body weight="semiBold">Cancel booking</Body>}
        useScrollView
      >
        <CancelForm
          loading={isMutatingBooking}
          onSubmit={handleCancelBooking}
        />
      </BottomSheet>

      <BottomSheet
        visible={!!bookingForReview}
        onDismiss={() => setBookingForReview(null)}
        titleElement={<Body weight="semiBold">Review sitter</Body>}
        useScrollView
      >
        <ReviewForm
          loading={isCreatingReview}
          onSubmit={handleCreateReview}
        />
      </BottomSheet>
    </ScreenContainer>
  );
};
