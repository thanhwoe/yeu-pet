import { PaywallNotice } from "@/components/PaywallNotice";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import { PET_KEY, SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { PetInfoForm } from "@/features/pets/components/PetInfoForm";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPagination, IPet, SubscriptionEntitlements } from "@/interfaces";
import { createPetMutation } from "@/services";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PawPrintIcon, PlusIcon } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { CARD_HEIGHT, CARD_WIDTH, SCALE_CENTER, SCALE_SIDE } from "./utils";

const Plus = withIconClassName(PlusIcon);
const PawPrint = withIconClassName(PawPrintIcon);
const CardWrapper = Animated.createAnimatedComponent(TouchableOpacity);

export const AddCard = ({
  index,
  scrollX,
  currentPetCount,
}: {
  index: number;
  scrollX: SharedValue<number>;
  currentPetCount: number;
}) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const {
    entitlements,
    getLimitState,
    isError: isEntitlementsError,
    isLoading: isEntitlementsLoading,
    isUpgrading,
    refetch: refetchEntitlements,
    upgrade,
  } = useEntitlements();
  const petLimit = getLimitState("maxPets", currentPetCount);
  const limitBenefits = useMemo(() => {
    const benefits = t("pets.limit.reachedBenefits", {
      returnObjects: true,
    });

    return Array.isArray(benefits) ? benefits.map(String) : [];
  }, [t]);

  const zoomStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [SCALE_SIDE, SCALE_CENTER, SCALE_SIDE],
      Extrapolation.CLAMP,
    );

    return { transform: [{ scale }] };
  });

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createPetMutation,
    onError(e) {
      Toast.error(
        getApiErrorToast(e, {
          titleKey: "pets.toast.addErrorTitle",
          textKey: "pets.toast.addErrorText",
        }),
      );
    },
    onSuccess(res, variable) {
      queryClient.setQueryData(PET_KEY.list(), (old: IPagination<IPet>) => {
        if (!old) {
          return old;
        }

        const data = [
          { ...res, avatarUrl: res.avatarUrl ?? variable.avatar?.uri },
          ...old.data,
        ];

        return {
          ...old,
          meta: {
            ...old.meta,
            total: old.meta.total + 1,
          },
          data,
        };
      });
      queryClient.setQueryData(
        SUBSCRIPTION_KEY.entitlements(),
        (old: SubscriptionEntitlements | undefined) =>
          old
            ? {
                ...old,
                usage: {
                  ...old.usage,
                  pets: old.usage.pets + 1,
                },
              }
            : old,
      );
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
      setShowForm(false);
    },
  });

  const handleSubmit = async (data: IPetInfoForm) => {
    if (!petLimit.allowed) {
      Toast.error({
        title: t("pets.toast.limitReachedTitle"),
        text: t("pets.toast.limitReachedText", { limit: petLimit.limit }),
      });
      return;
    }

    await mutateAsync(data);
  };

  return (
    <>
      <CardWrapper
        onPress={() => setShowForm(true)}
        accessibilityLabel={t("pets.addCard.accessibilityLabel")}
        accessibilityRole="button"
        className="relative items-center justify-center overflow-hidden rounded-28 border-[1.5px] border-dashed border-line-subtle bg-background-surface shadow-sm"
        style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, zoomStyle]}
      >
        <View className="mb-14 size-68 items-center justify-center rounded-full border-[1.5px] border-dashed border-line-subtle ">
          <Plus size={30} className="text-feature-pet-accent" />
        </View>
        <Body weight="bold" className="text-text-primary">
          {t("pets.addCard.title")}
        </Body>
        <Body variant="body2" className="text-text-muted">
          {t("pets.addCard.subtitle")}
        </Body>
        <View className="absolute right-24 top-20" style={{ opacity: 0.12 }}>
          <PawPrint
            size={46}
            weight="duotone"
            className="text-feature-pet-accent"
          />
        </View>
        <View className="absolute bottom-30 left-18" style={{ opacity: 0.1 }}>
          <PawPrint
            size={34}
            weight="duotone"
            className="text-feature-pet-accent"
          />
        </View>
      </CardWrapper>
      <BottomSheet
        stackBehavior="push"
        visible={showForm}
        onDismiss={() => setShowForm(false)}
        titleElement={<Body weight="semiBold">{t("pets.addCard.sheetTitle")}</Body>}
      >
        <View className="min-h-220 gap-16">
          {isEntitlementsLoading && !entitlements ? (
            <StateView
              variant="loading"
              title={t("pets.limit.loadingTitle")}
              description={t("pets.limit.loadingDescription")}
            />
          ) : isEntitlementsError && !entitlements ? (
            <StateView
              variant="error"
              title={t("pets.limit.errorTitle")}
              description={t("pets.limit.errorDescription")}
              actionLabel={t("common.tryAgain")}
              onAction={() => void refetchEntitlements()}
            />
          ) : !petLimit.allowed ? (
            <PaywallNotice
              variant="blocking"
              title={t("pets.limit.reachedTitle")}
              description={t("pets.limit.reachedDescription", {
                limit: petLimit.limit,
              })}
              benefits={limitBenefits}
              loading={isUpgrading}
              onAction={() => void upgrade()}
            />
          ) : (
            <PetInfoForm onSubmit={handleSubmit} isSubmitting={isPending} />
          )}
        </View>
      </BottomSheet>
    </>
  );
};
