import { Tabs } from "@/components/Tabs";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import {
  ISitterCancelForm,
  ISitterReviewFormValues,
} from "@/constants/validation";
import {
  BookingCard,
  BookingDetail,
  BookingRequestForm,
  CancelForm,
  hasSitterFilters,
  ReviewForm,
  SitterCard,
  SitterDetail,
  SitterFilterSheet,
  SitterProfileForm,
  SitterProfileStatus,
  SitterSkeleton,
  StatusFilterRow,
} from "@/features/sitter/components";
import { BOOKING_ROLE_TABS, SCREEN_TABS } from "@/features/sitter/constants";
import { SitterFilters, useSitters } from "@/features/sitter/useSitters";
import { formatRate } from "@/features/sitter/utils";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  IPetSitter,
  ISitterBooking,
  ISitterBookingForm,
  SitterBookingStatus,
} from "@/interfaces";
import { useUserInfoStore } from "@/stores/user-info";
import { cn } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { PencilSimpleIcon, SlidersHorizontalIcon } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";

const PencilSimple = withIconClassName(PencilSimpleIcon);
const SlidersHorizontal = withIconClassName(SlidersHorizontalIcon);

export const SitterScreen = () => {
  const router = useRouter();
  const currentUser = useUserInfoStore.use.user();
  const [activeTab, setActiveTab] = useState(SCREEN_TABS[0].value);
  const [bookingRoleTab, setBookingRoleTab] = useState(
    BOOKING_ROLE_TABS[0].value,
  );
  const [bookingStatus, setBookingStatus] = useState<
    SitterBookingStatus | undefined
  >();
  const [filters, setFilters] = useState<SitterFilters>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<IPetSitter | null>(null);
  const [bookingSitter, setBookingSitter] = useState<IPetSitter | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ISitterBooking | null>(
    null,
  );
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
    createReview,
    isCreatingBooking,
    isSavingProfile,
    isMutatingBooking,
    isCreatingReview,
  } = useSitters(filters, bookingStatus);

  const activeBookingRole = bookingRoleTab === 0 ? "owner" : "sitter";
  const hasActiveFilters = hasSitterFilters(filters);
  const isActiveBookingsLoading =
    bookingRoleTab === 0 ? isOwnerBookingsLoading : isSitterBookingsLoading;
  const isActiveBookingsError =
    bookingRoleTab === 0 ? isOwnerBookingsError : isSitterBookingsError;
  const canRequestSelectedSitterCare =
    Boolean(selectedSitter?.isAvailable) &&
    selectedSitter?.accountId !== currentUser?.id;

  const petById = useMemo(
    () => new Map(pets.map((pet) => [pet.id, pet])),
    [pets],
  );

  const sitterById = useMemo(() => {
    const mappedSitters = new Map(sitters.map((sitter) => [sitter.id, sitter]));

    if (mySitterProfile) {
      mappedSitters.set(mySitterProfile.id, mySitterProfile);
    }

    return mappedSitters;
  }, [mySitterProfile, sitters]);

  const hydrateBooking = useCallback(
    (booking: ISitterBooking): ISitterBooking => ({
      ...booking,
      pet: booking.pet ?? petById.get(booking.petId),
      sitter: booking.sitter ?? sitterById.get(booking.sitterId),
    }),
    [petById, sitterById],
  );

  const activeBookings = useMemo(
    () =>
      (bookingRoleTab === 0 ? ownerBookings : sitterBookings).map(
        hydrateBooking,
      ),
    [bookingRoleTab, hydrateBooking, ownerBookings, sitterBookings],
  );

  const filterSummary = useMemo(
    () =>
      [
        filters.city,
        filters.district,
        filters.minRating && `★${filters.minRating}+`,
        filters.maxPrice && `under ${formatRate(filters.maxPrice)}`,
      ]
        .filter(Boolean)
        .join(" · "),
    [filters],
  );

  const openSitterDetail = useCallback((sitter: IPetSitter) => {
    setSelectedSitter(null);
    setTimeout(() => setSelectedSitter(sitter), 0);
  }, []);

  const renderSitter = useCallback<ListRenderItem<IPetSitter>>(
    ({ item }) => <SitterCard sitter={item} onPress={openSitterDetail} />,
    [openSitterDetail],
  );

  const renderBooking = useCallback<ListRenderItem<ISitterBooking>>(
    ({ item }) => (
      <BookingCard
        booking={item}
        role={activeBookingRole}
        onPress={setSelectedBooking}
      />
    ),
    [activeBookingRole],
  );

  const handleCreateBooking = async (data: ISitterBookingForm) => {
    await createBooking(data);
    setBookingSitter(null);
    setSelectedSitter(null);
    setActiveTab(1);
  };

  const handleCancelBooking = async (data: ISitterCancelForm) => {
    if (!bookingForCancel) return;

    await cancelBooking({ id: bookingForCancel.id, reason: data.reason });
    setBookingForCancel(null);
    setSelectedBooking(null);
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
    setSelectedBooking(null);
  };

  const openBookingMessages = useCallback(
    (booking: ISitterBooking) => {
      setSelectedBooking(null);
      router.push({
        pathname: "/sitter-bookings/[id]/chat",
        params: { id: booking.id },
      });
    },
    [router],
  );

  const openCancelBooking = useCallback((booking: ISitterBooking) => {
    setSelectedBooking(null);
    setBookingForCancel(booking);
  }, []);

  const openBookingReview = useCallback((booking: ISitterBooking) => {
    setSelectedBooking(null);
    setBookingForReview(booking);
  }, []);

  return (
    <ScreenContainer>
      <View className="pt-safe-offset-20 pb-16 gap-12">
        <View className="flex-row items-start justify-between gap-12">
          <View className="flex-1">
            <Heading variant="h4" weight="bold">
              Sitter
            </Heading>
          </View>
          <View className="flex-row gap-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter sitters"
              accessibilityState={{ selected: hasActiveFilters }}
              onPress={() => setFilterSheetOpen(true)}
              className={cn(
                "h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface",
                hasActiveFilters && "border-action-primary bg-action-primary",
              )}
            >
              <SlidersHorizontal
                size={20}
                className={
                  hasActiveFilters
                    ? "text-action-primary-foreground"
                    : "text-icon-primary"
                }
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                mySitterProfile
                  ? "Edit sitter profile"
                  : "Create sitter profile"
              }
              onPress={() => setProfileFormOpen(true)}
              className="h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface"
            >
              <PencilSimple size={20} className="text-icon-primary" />
            </Pressable>
          </View>
        </View>
        {hasActiveFilters ? (
          <View className="rounded-full bg-background-surface-muted px-12 py-7 self-start">
            <Body variant="body4" className="text-text-muted">
              {filterSummary}
            </Body>
          </View>
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
          estimatedItemSize={190}
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
                title="No sitters match"
                description={
                  hasActiveFilters
                    ? "Clear filters to see more trusted sitters nearby."
                    : "Available pet sitters will appear here."
                }
                actionLabel={hasActiveFilters ? "Clear filters" : undefined}
                onAction={hasActiveFilters ? () => setFilters({}) : undefined}
              />
            );
          }}
        />
      ) : (
        <View className="flex-1">
          <SitterProfileStatus profile={mySitterProfile} />
          <Tabs
            tabs={BOOKING_ROLE_TABS}
            active={bookingRoleTab}
            onChange={setBookingRoleTab}
            className="mb-14 self-center"
          />
          <StatusFilterRow value={bookingStatus} onChange={setBookingStatus} />
          <FlashList
            data={activeBookings}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-safe"
            estimatedItemSize={154}
            showsVerticalScrollIndicator={false}
            renderItem={renderBooking}
            refreshing={isRefreshing}
            onRefresh={refetchAll}
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
                    description="Use the pencil in the header to create your sitter profile before receiving requests."
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
                      : "Requests from pet owners will appear here after your profile is available."
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
          <SitterDetail
            sitter={selectedSitter}
            canRequestCare={canRequestSelectedSitterCare}
            onRequestCare={() => {
              if (!canRequestSelectedSitterCare) return;

              const sitterForBooking = selectedSitter;
              setSelectedSitter(null);
              setTimeout(() => setBookingSitter(sitterForBooking), 250);
            }}
          />
        ) : null}
      </BottomSheet>

      <BottomSheet
        visible={!!bookingSitter}
        onDismiss={() => setBookingSitter(null)}
        titleElement={<Body weight="semiBold">Request care</Body>}
        useScrollView
      >
        {bookingSitter ? (
          <BookingRequestForm
            sitter={bookingSitter}
            pets={pets}
            onSubmit={handleCreateBooking}
            loading={isCreatingBooking}
          />
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
        visible={!!selectedBooking}
        onDismiss={() => setSelectedBooking(null)}
        titleElement={<Body weight="semiBold">Booking detail</Body>}
        useScrollView
      >
        {selectedBooking ? (
          <BookingDetail
            booking={selectedBooking}
            role={activeBookingRole}
            loading={isMutatingBooking}
            onOpenMessages={openBookingMessages}
            onCancel={openCancelBooking}
            onReview={openBookingReview}
            onAccept={(booking) => {
              void acceptBooking(booking.id).then(() =>
                setSelectedBooking(null),
              );
            }}
            onComplete={(booking) => {
              void completeBooking(booking.id).then(() =>
                setSelectedBooking(null),
              );
            }}
            onReject={(booking) => {
              Alert.alert(
                "Reject booking?",
                "This will let the owner know you cannot take this request.",
                [
                  { text: "Keep", style: "cancel" },
                  {
                    text: "Reject",
                    style: "destructive",
                    onPress: () => {
                      void rejectBooking(booking.id).then(() =>
                        setSelectedBooking(null),
                      );
                    },
                  },
                ],
              );
            }}
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
        <ReviewForm loading={isCreatingReview} onSubmit={handleCreateReview} />
      </BottomSheet>
    </ScreenContainer>
  );
};
