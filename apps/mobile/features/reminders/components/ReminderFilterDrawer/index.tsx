import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";
import { PET_KEY } from "@/constants/query-keys";
import { useReminderUiStore } from "@/features/reminders/store";
import { ReminderType, VisibleReminderStatus } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { cn } from "@/utils";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_FILTERS: { labelKey: string; value?: VisibleReminderStatus }[] = [
  { labelKey: "reminders.filters.all" },
  { labelKey: "reminders.status.pending", value: "pending" },
  { labelKey: "reminders.status.sent", value: "sent" },
  { labelKey: "reminders.status.cancelled", value: "cancelled" },
];

const TYPE_FILTERS: { labelKey: string; value?: ReminderType }[] = [
  { labelKey: "reminders.filters.allTypes" },
  { labelKey: "reminders.type.feeding", value: "feeding" },
  { labelKey: "reminders.type.grooming", value: "grooming" },
  { labelKey: "reminders.type.vaccination", value: "vaccination" },
  { labelKey: "reminders.type.medication", value: "medication" },
];

export const ReminderFilterDrawer = ({
  navigation,
}: DrawerContentComponentProps) => {
  const { t } = useTranslation();
  const statusFilter = useReminderUiStore((state) => state.statusFilter);
  const typeFilter = useReminderUiStore((state) => state.typeFilter);
  const petFilter = useReminderUiStore((state) => state.petFilter);
  const setFilters = useReminderUiStore((state) => state.setFilters);
  const resetFilters = useReminderUiStore((state) => state.resetFilters);

  const [draftStatus, setDraftStatus] = useState<
    VisibleReminderStatus | undefined
  >();
  const [draftType, setDraftType] = useState<ReminderType | undefined>();
  const [draftPetId, setDraftPetId] = useState<string | undefined>();

  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  useEffect(() => {
    setDraftStatus(statusFilter);
    setDraftType(typeFilter);
    setDraftPetId(petFilter);
  }, [petFilter, statusFilter, typeFilter]);

  const closeDrawer = () => navigation.closeDrawer();

  const handleApply = () => {
    setFilters({ status: draftStatus, type: draftType, petId: draftPetId });
    closeDrawer();
  };

  const handleReset = () => {
    setDraftStatus(undefined);
    setDraftType(undefined);
    setDraftPetId(undefined);
    resetFilters();
    closeDrawer();
  };

  return (
    <SafeAreaView className="h-full bg-background-card">
      <View className="flex-1">
        <View className="border-b border-line-subtle px-20 pb-18 pt-20">
          <Heading variant="h5" weight="bold">
            {t("reminders.filters.title")}
          </Heading>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-22 px-20 py-20"
        >
          <FilterGroup title={t("reminders.filters.status")}>
            {STATUS_FILTERS.map((item) => (
              <FilterOption
                key={item.labelKey}
                label={t(item.labelKey)}
                selected={draftStatus === item.value}
                onPress={() => setDraftStatus(item.value)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("reminders.filters.type")}>
            {TYPE_FILTERS.map((item) => (
              <FilterOption
                key={item.labelKey}
                label={t(item.labelKey)}
                selected={draftType === item.value}
                onPress={() => setDraftType(item.value)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("reminders.filters.pet")}>
            <FilterOption
              label={t("reminders.filters.allPets")}
              selected={!draftPetId}
              onPress={() => setDraftPetId(undefined)}
            />
            {(petData?.data ?? []).map((pet) => (
              <FilterOption
                key={pet.id}
                label={pet.name}
                selected={draftPetId === pet.id}
                onPress={() => setDraftPetId(pet.id)}
              />
            ))}
          </FilterGroup>
        </ScrollView>

        <View className="flex-row gap-12 border-t border-line-subtle px-20 pt-16">
          <Button
            variant="outline"
            size="md"
            wrapperClassName="flex-1"
            onPress={handleReset}
          >
            {t("reminders.actions.reset")}
          </Button>
          <Button
            variant="secondary"
            size="md"
            wrapperClassName="flex-1"
            onPress={handleApply}
          >
            {t("reminders.actions.apply")}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FilterGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <View className="gap-10">
    <Body variant="body3" weight="bold">
      {title}
    </Body>
    <View className="gap-8">{children}</View>
  </View>
);

const FilterOption = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={onPress}
    className={cn(
      "min-h-44 justify-center rounded-14 border border-line-subtle bg-background-surface-muted px-14",
      selected && "border-action-primary bg-action-secondary",
    )}
  >
    <Body
      variant="body3"
      weight="semiBold"
      className={cn(
        "text-text-muted",
        selected && "text-action-secondary-foreground",
      )}
    >
      {label}
    </Body>
  </Pressable>
);
