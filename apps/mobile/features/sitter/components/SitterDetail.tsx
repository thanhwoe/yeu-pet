import { Skeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { useSitterReviews } from "@/features/sitter/useSitters";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPetSitter, ISitterReview } from "@/interfaces";
import { date } from "@/utils";
import { MapPinIcon, PawPrintIcon, StarIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { formatRate, getLocationLine, getSitterName } from "../utils";
import { AvailabilityBadge, InfoRow } from "./SitterPrimitives";

const MapPin = withIconClassName(MapPinIcon);
const PawPrint = withIconClassName(PawPrintIcon);
const Star = withIconClassName(StarIcon);

const getReviewerName = (review: ISitterReview) => {
  const name = [review.accounts?.firstName, review.accounts?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "";
};

const RecentSitterReviews = ({ sitter }: { sitter: IPetSitter }) => {
  const { t } = useTranslation();
  const reviewsQuery = useSitterReviews(sitter.id);
  const reviews = reviewsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const totalReviews =
    reviewsQuery.data?.pages[0]?.meta.total ?? sitter.totalReviews ?? 0;

  return (
    <View className="gap-12">
      <View className="flex-row items-center justify-between gap-12">
        <Heading variant="h6" weight="bold">
          {t("sitter.detail.reviews")}
        </Heading>
        <Body variant="body4" className="text-text-muted">
          {t("sitter.detail.totalReviews", { count: totalReviews })}
        </Body>
      </View>

      {reviewsQuery.isLoading ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t("sitter.accessibility.loadingReviews")}
          className="gap-10"
        >
          <Skeleton
            className="h-74 rounded-18"
            backgroundClassName="bg-background-surface-muted"
          />
          <Skeleton
            className="h-74 rounded-18"
            backgroundClassName="bg-background-surface-muted"
          />
          <Skeleton
            className="h-74 rounded-18"
            backgroundClassName="bg-background-surface-muted"
          />
        </View>
      ) : reviewsQuery.isError && !reviews.length ? (
        <StateView
          variant="error"
          title={t("sitter.detail.reviewsErrorTitle")}
          description={t("sitter.detail.reviewsErrorDescription")}
          actionLabel={t("common.retry")}
          onAction={() => reviewsQuery.refetch()}
          className="min-h-140"
        />
      ) : reviews.length ? (
        <View className="gap-10">
          {reviews.map((review) => (
            <View
              key={review.id}
              className="gap-6 rounded-18 border border-line-subtle bg-background-surface px-12 py-12"
            >
              <View className="flex-row items-center justify-between gap-12">
                <Body
                  variant="body3"
                  weight="semiBold"
                  numberOfLines={1}
                  className="min-w-0 flex-1"
                >
                  {getReviewerName(review) ||
                    t("sitter.profile.ownerFallback")}
                </Body>
                <View
                  accessible
                  accessibilityLabel={t("sitter.accessibility.rated", {
                    rating: review.rating,
                  })}
                  className="shrink-0 flex-row items-center gap-4"
                >
                  <Star
                    size={14}
                    weight="fill"
                    className="text-status-warning-icon"
                  />
                  <Body variant="body4" weight="semiBold">
                    {review.rating}
                  </Body>
                </View>
              </View>
              {review.comment ? (
                <Body
                  variant="body4"
                  className="text-text-muted"
                  numberOfLines={3}
                >
                  {review.comment}
                </Body>
              ) : null}
              {review.createdAt ? (
                <Body variant="body5" className="text-text-muted">
                  {date(review.createdAt).format("DD MMM YYYY")}
                </Body>
              ) : null}
            </View>
          ))}

          {reviewsQuery.isFetchNextPageError ? (
            <View className="items-center gap-8 py-4">
              <Body variant="body4" className="text-center text-text-muted">
                {t("sitter.detail.moreReviewsError")}
              </Body>
              <Button
                variant="outline"
                size="md"
                onPress={() => reviewsQuery.fetchNextPage()}
                accessibilityLabel={t("sitter.accessibility.retryLoadingReviews")}
              >
                {t("common.tryAgain")}
              </Button>
            </View>
          ) : reviewsQuery.hasNextPage ? (
            <Button
              variant="outline"
              size="md"
              loading={reviewsQuery.isFetchingNextPage}
              onPress={() => reviewsQuery.fetchNextPage()}
              accessibilityLabel={t("sitter.accessibility.showMoreReviews")}
            >
              {t("sitter.detail.showMoreReviews")}
            </Button>
          ) : (
            <Body variant="body4" className="py-4 text-center text-text-muted">
              {t("sitter.detail.allReviewsLoaded")}
            </Body>
          )}
        </View>
      ) : (
        <StateView
          variant="empty"
          title={t("sitter.detail.noReviewsTitle")}
          description={t("sitter.detail.noReviewsDescription")}
          className="min-h-128"
        />
      )}
    </View>
  );
};

export const SitterDetail = ({
  sitter,
  canRequestCare,
  onRequestCare,
  requestUnavailableText,
}: {
  sitter: IPetSitter;
  canRequestCare: boolean;
  onRequestCare: () => void;
  requestUnavailableText?: string;
}) => {
  const { t } = useTranslation();

  return (
    <View className="gap-16 px-16">
      <View className="gap-14 rounded-28 border border-line-subtle bg-background-surface px-16 py-16">
        <View className="flex-row items-start gap-14">
          <Avatar
            size="huge"
            source={{ uri: sitter.account?.avatarUrl ?? undefined }}
          />
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-10">
              <View className="flex-1">
                <Heading variant="h5" weight="bold" numberOfLines={1}>
                  {getSitterName(sitter)}
                </Heading>
                <Body
                  variant="body3"
                  className="text-text-muted"
                  numberOfLines={1}
                >
                  {getLocationLine(sitter)}
                </Body>
              </View>
              <AvailabilityBadge available={sitter.isAvailable} />
            </View>

            <View className="mt-10 flex-row items-center gap-4">
              <Star
                size={16}
                weight="fill"
                className="text-status-warning-icon"
              />
              <Body variant="body3" weight="semiBold">
                {Number(sitter.avgRating || 0).toFixed(1)}
              </Body>
              <Body variant="body4" className="text-text-muted">
                {`(${t("sitter.detail.totalReviews", {
                  count: sitter.totalReviews || 0,
                })})`}
              </Body>
            </View>
          </View>
        </View>

        <View className="flex-row gap-10">
          <View className="flex-1 rounded-20 bg-background-surface-muted px-12 py-12">
            <Body variant="body5" caps className="text-text-muted">
              {t("sitter.detail.hourly")}
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.hourlyRate)}
            </Body>
          </View>
          <View className="flex-1 rounded-20 bg-background-surface-muted px-12 py-12">
            <Body variant="body5" caps className="text-text-muted">
              {t("sitter.detail.daily")}
            </Body>
            <Body variant="body3" weight="bold">
              {formatRate(sitter.dailyRate)}
            </Body>
          </View>
        </View>

        {canRequestCare ? (
          <Button onPress={onRequestCare}>
            {t("sitter.detail.requestCare")}
          </Button>
        ) : requestUnavailableText ? (
          <View className="rounded-18 border border-line-subtle bg-background-surface-muted px-12 py-12">
            <Body variant="body4" className="text-text-muted">
              {requestUnavailableText}
            </Body>
          </View>
        ) : null}
      </View>

      <View className="gap-10 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <Heading variant="h6" weight="bold">
          {t("sitter.detail.about")}
        </Heading>
        <Body variant="body3" className="text-text-muted">
          {sitter.bio || t("sitter.detail.bioFallback")}
        </Body>
        {sitter.serviceNotes ? (
          <Body variant="body3" className="text-text-muted">
            {sitter.serviceNotes}
          </Body>
        ) : null}
      </View>

      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <Heading variant="h6" weight="bold">
          {t("sitter.detail.careDetails")}
        </Heading>
        <InfoRow
          icon={
            <MapPin
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.detail.serviceArea")}
          value={getLocationLine(sitter)}
        />
        {sitter.experience ? (
          <InfoRow
            icon={
              <PawPrint
                size={16}
                weight="duotone"
                className="text-feature-sitter-accent"
              />
            }
            label={t("sitter.detail.experience")}
            value={sitter.experience}
          />
        ) : null}
      </View>

      <RecentSitterReviews sitter={sitter} />
    </View>
  );
};
