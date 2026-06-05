import { GroupedReminder, IReminder } from "@/interfaces";
import { forwardRef, memo, useCallback, useMemo } from "react";
import { SectionList, View } from "react-native";
import { AgendaList as List } from "react-native-calendars";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { AgendaDate } from "./AgendaDate";
import { AgendaItem } from "./AgendaItem";

interface IProps {
  onEdit: (v: IReminder) => void;
  onDelete: (v: IReminder) => void;
  deleting?: boolean;
  updating?: boolean;
  actioningId?: string;
  error?: boolean;
  hasFilters?: boolean;
  loading?: boolean;
  data: GroupedReminder[];
  onRetry?: () => void;
  onComplete: (v: IReminder) => void;
  onSkip: (v: IReminder) => void;
  onCancelReminder: (v: IReminder) => void;
}

export const AgendaList = memo(
  forwardRef<SectionList, IProps>(
    (
      {
        data,
        onDelete,
        onEdit,
        deleting,
        updating,
        loading,
        error,
        hasFilters,
        actioningId,
        onRetry,
        onComplete,
        onSkip,
        onCancelReminder,
      },
      ref,
    ) => {
      const renderItem = useCallback(
        ({ item }: { item: IReminder }) => {
          const handleEdit = (v: IReminder) => {
            if (v.status !== "pending") {
              Toast.warn({
                text: "Reminder sent or cancelled cannot update. Please create new one.",
                title: "Cannot edit this reminder",
                duration: 10_000,
              });
              return;
            }
            onEdit(v);
          };
          return (
            <AgendaItem
              item={item}
              onEdit={handleEdit}
              onDelete={onDelete}
              editing={updating}
              deleting={deleting}
              actioning={actioningId === item.id}
              onComplete={onComplete}
              onSkip={onSkip}
              onCancelReminder={onCancelReminder}
            />
          );
        },
        [
          actioningId,
          deleting,
          onCancelReminder,
          onComplete,
          onDelete,
          onEdit,
          onSkip,
          updating,
        ],
      );

      const ListEmptyComponent = useMemo(() => {
        if (loading) {
          return (
            <View className="gap-16 mt-20">
              <Skeleton
                className="h-80"
                backgroundClassName="bg-background-primary"
              />
              <Skeleton
                className="h-80"
                backgroundClassName="bg-background-primary"
              />
              <Skeleton
                className="h-80"
                backgroundClassName="bg-background-primary"
              />
            </View>
          );
        }
        if (error) {
          return (
            <StateView
              variant="error"
              title="Reminders could not load"
              description="Try again to refresh this calendar."
              actionLabel="Retry"
              onAction={onRetry}
              className="mt-24 rounded-18 bg-background-card-highlight"
            />
          );
        }
        return (
          <View className="mt-40 gap-8 px-16">
            <Heading variant="h5" center>
              {hasFilters
                ? "No reminders match these filters"
                : "No reminders added yet"}
            </Heading>
            <Body center>
              {hasFilters
                ? "Adjust the filters to find another care task."
                : "Start by adding your first one!"}
            </Body>
          </View>
        );
      }, [error, hasFilters, loading, onRetry]);

      return (
        <List
          ref={ref}
          sections={data}
          renderItem={renderItem}
          scrollToNextEvent={false}
          renderSectionHeader={AgendaDate}
          removeClippedSubviews
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          ListEmptyComponent={ListEmptyComponent}
        />
      );
    },
  ),
);

AgendaList.displayName = "AgendaList";
