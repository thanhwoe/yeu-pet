import { Tabs } from "@/components/Tabs";
import { Popup } from "@/components/Popup";
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
  BookingListSkeleton,
  BookingRequestForm,
  CancelForm,
  ReviewForm,
  SitterActiveFilters,
  SitterCard,
  SitterDetail,
  SitterProfileForm,
  SitterProfileStatus,
  SitterSkeleton,
  StatusFilterRow,
} from "@/features/sitter/components";
import { getBookingRoleTabs, getScreenTabs } from "@/features/sitter/constants";
import { hasSitterFilters } from "@/features/sitter/filters";
import { useSitterFilters } from "@/features/sitter/SitterFiltersContext";
import {
  useSitterBookingDetail,
  useSitters,
} from "@/features/sitter/useSitters";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  IPetSitter,
  ISitterBooking,
  ISitterBookingForm,
  SitterBookingStatus,
} from "@/interfaces";
import { useUserInfoStore } from "@/stores/user-info";
import { cn } from "@/utils";
import { DrawerActions } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { PencilSimpleIcon, SlidersHorizontalIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";

const PencilSimple = withIconClassName(PencilSimpleIcon);
const SlidersHorizontal = withIconClassName(SlidersHorizontalIcon);

export const SitterScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { appliedFilters, filterRevision, beginEditing, clearAppliedFilters } =
    useSitterFilters();
  const { tab, role, bookingId } = useLocalSearchParams<{
    tab?: string;
    role?: string;
    bookingId?: string;
  }>();
  const openedBookingIdRef = useRef<string | undefined>(undefined);
  const { data: linkedBooking } = useSitterBookingDetail(bookingId);
  const currentUser = useUserInfoStore.use.user();
  const screenTabs = getScreenTabs();
  const bookingRoleTabs = getBookingRoleTabs();
  const [activeTab, setActiveTab] = useState(screenTabs[0].value);
  const [bookingRoleTab, setBookingRoleTab] = useState(
    bookingRoleTabs[0].value,
  );
  const [bookingStatus, setBookingStatus] = useState<
    SitterBookingStatus | undefined
  >();
  const [selectedSitter, setSelectedSitter] = useState<IPetSitter | null>(null);
  const [bookingSitter, setBookingSitter] = useState<IPetSitter | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ISitterBooking | null>(
    null,
  );
  const [bookingForCancel, setBookingForCancel] =
    useState<ISitterBooking | null>(null);
  const [bookingForComplete, setBookingForComplete] =
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
    isOwnerBookingsFetching,
    isSitterBookingsLoading,
    isSitterBookingsFetching,
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
  } = useSitters(appliedFilters, bookingStatus, filterRevision);

  const activeBookingRole = bookingRoleTab === 0 ? "owner" : "sitter";
  const hasActiveFilters = hasSitterFilters(appliedFilters);
  const isActiveBookingsLoading =
    bookingRoleTab === 0 ? isOwnerBookingsLoading : isSitterBookingsLoading;
  const isActiveBookingsFetching =
    bookingRoleTab === 0 ? isOwnerBookingsFetching : isSitterBookingsFetching;
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

  useEffect(() => {
    if (tab === "bookings" || bookingId) {
      setActiveTab(screenTabs[1].value);
    }
    if (role === "sitter" || bookingId) {
      setBookingRoleTab(bookingRoleTabs[1].value);
    }
  }, [bookingId, bookingRoleTabs, role, screenTabs, tab]);

  useEffect(() => {
    if (!bookingId || openedBookingIdRef.current === bookingId) {
      return;
    }

    const booking =
      linkedBooking ?? activeBookings.find((item) => item.id === bookingId);
    if (booking) {
      openedBookingIdRef.current = bookingId;
      setSelectedBooking(hydrateBooking(booking));
    }
  }, [activeBookings, bookingId, hydrateBooking, linkedBooking]);

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

  const handleCompleteBooking = async () => {
    if (!bookingForComplete || isMutatingBooking) return;

    try {
      await completeBooking(bookingForComplete.id);
      setSelectedBooking(null);
    } catch {
      // Toast copy is handled by the shared sitter mutation hook.
    } finally {
      setBookingForComplete(null);
    }
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
              {t("sitter.screen.title")}
            </Heading>
          </View>
          <View className="flex-row gap-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("sitter.accessibility.filterSitters")}
              accessibilityState={{ selected: hasActiveFilters }}
              onPress={() => {
                beginEditing();
                navigation.dispatch(DrawerActions.openDrawer());
              }}
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
                  ? t("sitter.accessibility.editProfile")
                  : t("sitter.accessibility.createProfile")
              }
              onPress={() => setProfileFormOpen(true)}
              className="h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface"
            >
              <PencilSimple size={20} className="text-icon-primary" />
            </Pressable>
          </View>
        </View>
        <SitterActiveFilters />
      </View>

      <Tabs
        tabs={screenTabs}
        active={activeTab}
        onChange={setActiveTab}
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
                  title={t("sitter.screen.loadErrorTitle")}
                  description={t("sitter.screen.loadErrorDescription")}
                  actionLabel={t("common.tryAgain")}
                  onAction={() => refetch()}
                />
              );
            }

            return (
              <StateView
                variant="empty"
                title={t("sitter.screen.emptySittersTitle")}
                description={
                  hasActiveFilters
                    ? t("sitter.screen.emptyFilteredDescription")
                    : t("sitter.screen.emptySittersDescription")
                }
                actionLabel={
                  hasActiveFilters ? t("sitter.filters.reset") : undefined
                }
                onAction={hasActiveFilters ? clearAppliedFilters : undefined}
              />
            );
          }}
        />
      ) : (
        <View className="flex-1">
          <SitterProfileStatus profile={mySitterProfile} />
          <Tabs
            tabs={bookingRoleTabs}
            active={bookingRoleTab}
            onChange={setBookingRoleTab}
            className="mb-14 self-center"
          />
          <StatusFilterRow value={bookingStatus} onChange={setBookingStatus} />
          {isActiveBookingsLoading || isActiveBookingsFetching ? (
            <BookingListSkeleton />
          ) : (
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
                if (isActiveBookingsError) {
                  return (
                    <StateView
                      variant="error"
                      title={t("sitter.booking.empty.bookingsErrorTitle")}
                      description={t(
                        "sitter.booking.empty.bookingsErrorDescription",
                      )}
                      actionLabel={t("common.retry")}
                      onAction={refetchAll}
                    />
                  );
                }

                if (activeBookingRole === "sitter" && !hasSitterProfile) {
                  return (
                    <StateView
                      variant="empty"
                      title={t("sitter.booking.empty.createProfileTitle")}
                      description={t(
                        "sitter.booking.empty.createProfileDescription",
                      )}
                    />
                  );
                }

                return (
                  <StateView
                    variant="empty"
                    title={t("sitter.booking.empty.noBookingsTitle")}
                    description={
                      activeBookingRole === "owner"
                        ? t("sitter.booking.empty.noBookingsOwner")
                        : t("sitter.booking.empty.noBookingsSitter")
                    }
                  />
                );
              }}
            />
          )}
        </View>
      )}

      <BottomSheet
        visible={!!selectedSitter}
        onDismiss={() => setSelectedSitter(null)}
        titleElement={
          <Body weight="semiBold">{t("sitter.profile.profileTitle")}</Body>
        }
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
        titleElement={
          <Body weight="semiBold">{t("sitter.screen.requestCare")}</Body>
        }
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
            {mySitterProfile
              ? t("sitter.profile.edit")
              : t("sitter.profile.become")}
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
        titleElement={
          <Body weight="semiBold">
            {t("sitter.booking.detail.bookingDetail")}
          </Body>
        }
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
            onComplete={setBookingForComplete}
            onReject={(booking) => {
              Alert.alert(
                t("sitter.booking.rejectAlert.title"),
                t("sitter.booking.rejectAlert.message"),
                [
                  {
                    text: t("sitter.booking.rejectAlert.keep"),
                    style: "cancel",
                  },
                  {
                    text: t("sitter.booking.rejectAlert.confirm"),
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
        titleElement={
          <Body weight="semiBold">{t("sitter.booking.actions.cancel")}</Body>
        }
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
        titleElement={
          <Body weight="semiBold">{t("sitter.screen.reviewSitter")}</Body>
        }
        useScrollView
      >
        <ReviewForm loading={isCreatingReview} onSubmit={handleCreateReview} />
      </BottomSheet>

      <Popup
        visible={!!bookingForComplete}
        variant="confirm"
        title={t("sitter.booking.completeConfirm.title")}
        description={t("sitter.booking.completeConfirm.description")}
        cancelLabel={t("sitter.booking.completeConfirm.cancel")}
        confirmLabel={t("sitter.booking.completeConfirm.confirm")}
        loading={isMutatingBooking}
        onCancel={() => setBookingForComplete(null)}
        onConfirm={handleCompleteBooking}
      />
    </ScreenContainer>
  );
};
