import { Skeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { useSitterReviews } from "@/features/sitter/useSitters";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPetSitter, ISitterReview } from "@/interfaces";
import { MapPinIcon, PawPrintIcon, StarIcon } from "phosphor-react-native";
import { View } from "react-native";
import { formatRate, getLocationLine, getSitterName } from "../utils";
import {
  AvailabilityBadge,
  ExternalPaymentNotice,
  InfoRow,
} from "./SitterPrimitives";

const MapPin = withIconClassName(MapPinIcon);
const PawPrint = withIconClassName(PawPrintIcon);
const Star = withIconClassName(StarIcon);

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
          Reviews
        </Heading>
        <Body variant="body4" className="text-text-muted">
          {sitter.totalReviews || 0} total
        </Body>
      </View>

      {reviewsQuery.isFetching ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Loading sitter reviews"
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
              className="gap-6 rounded-18 border border-line-subtle bg-background-surface px-12 py-12"
            >
              <View className="flex-row items-center justify-between gap-12">
                <Body variant="body3" weight="semiBold" numberOfLines={1}>
                  {getReviewerName(review)}
                </Body>
                <View className="flex-row items-center gap-4">
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
}: {
  sitter: IPetSitter;
  canRequestCare: boolean;
  onRequestCare: () => void;
}) => (
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
              ({sitter.totalReviews || 0} reviews)
            </Body>
          </View>
        </View>
      </View>

      <View className="flex-row gap-10">
        <View className="flex-1 rounded-20 bg-background-surface-muted px-12 py-12">
          <Body variant="body5" caps className="text-text-muted">
            Hourly
          </Body>
          <Body variant="body3" weight="bold">
            {formatRate(sitter.hourlyRate)}
          </Body>
        </View>
        <View className="flex-1 rounded-20 bg-background-surface-muted px-12 py-12">
          <Body variant="body5" caps className="text-text-muted">
            Daily
          </Body>
          <Body variant="body3" weight="bold">
            {formatRate(sitter.dailyRate)}
          </Body>
        </View>
      </View>

      {canRequestCare ? (
        <Button onPress={onRequestCare}>Request care</Button>
      ) : null}
    </View>

    <View className="gap-10 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
      <Heading variant="h6" weight="bold">
        About
      </Heading>
      <Body variant="body3" className="text-text-muted">
        {sitter.bio || "This sitter has not added a bio yet."}
      </Body>
      {sitter.serviceNotes ? (
        <Body variant="body3" className="text-text-muted">
          {sitter.serviceNotes}
        </Body>
      ) : null}
    </View>

    <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
      <Heading variant="h6" weight="bold">
        Care details
      </Heading>
      <InfoRow
        icon={
          <MapPin
            size={16}
            weight="duotone"
            className="text-feature-sitter-accent"
          />
        }
        label="Service area"
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
          label="Experience"
          value={sitter.experience}
        />
      ) : null}
    </View>

    <RecentSitterReviews sitter={sitter} />
    <ExternalPaymentNotice compact />
  </View>
);
