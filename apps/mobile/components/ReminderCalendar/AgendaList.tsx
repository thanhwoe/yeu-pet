import { GroupedReminder, IReminder } from "@/interfaces";
import { forwardRef, memo, useCallback, useMemo } from "react";
import { SectionList, View } from "react-native";
import { AgendaList as List } from "react-native-calendars";
import { Skeleton } from "../Skeleton";
import { Toast } from "../Toast";
import { Body, Heading } from "../ui/Typography";
import { AgendaDate } from "./AgendaDate";
import { AgendaItem } from "./AgendaItem";

interface IProps {
  onEdit: (v: IReminder) => void;
  onDelete: (v: IReminder) => void;
  deleting?: boolean;
  updating?: boolean;
  loading?: boolean;
  data: GroupedReminder[];
}

export const AgendaList = memo(
  forwardRef<SectionList, IProps>(
    ({ data, onDelete, onEdit, deleting, updating, loading }, ref) => {
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
            />
          );
        },
        [deleting, onDelete, onEdit, updating],
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
        return (
          <View className="mt-40 gap-8">
            <Heading variant="h5" center>
              No reminders added yet.
            </Heading>
            <Body center>Start by adding your first one!</Body>
          </View>
        );
      }, [loading]);

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
