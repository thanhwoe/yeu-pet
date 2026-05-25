import { Popup } from "@/components/Popup";
import { RefreshControl } from "@/components/RefreshControl";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import { MEDICAL_RECORDS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import {
  deleteMedicalRecordMutation,
  getMedicalRecordsByPetIdQuery,
} from "@/services";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { TrashIcon } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { MedicalRecordListItem } from "./MedicalRecordListItem";

const DeleteIcon = withIconClassName(TrashIcon);
const PAGE_SIZE = 20;

export const MedicalRecordListScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName?: string;
  }>();

  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null,
  );
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  useEffect(() => {
    if (!petName) return;

    navigation.setOptions({
      title: `${petName} Records`,
    });
  }, [navigation, petName]);

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: MEDICAL_RECORDS_KEY.list({ petId, limit: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getMedicalRecordsByPetIdQuery({
        petId,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    enabled: !!petId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;
      return lastPage.meta.page + 1;
    },
  });

  const records = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });
      setOpenDeletePopup(false);
      setSelectedRecord(null);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleDelete = () => {
    if (selectedRecord?.id) {
      deleteMedicalRecord(selectedRecord.id);
    }
  };

  return (
    <ScreenContainer className="px-0">
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-20 pt-20 pb-safe gap-12"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colorClassName="text-text-primary"
          />
        }
        renderItem={({ item }) => (
          <MedicalRecordListItem
            record={item}
            onPress={() => {
              router.push({
                pathname: "/medical-record/[id]",
                params: { id: item.id },
              });
            }}
            onMorePress={() => setSelectedRecord(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-12">
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
          ) : (
            <Body center>No medical records yet</Body>
          )
        }
        ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
        onEndReached={() => {
          if (isLoading || isFetchingNextPage || !hasNextPage) return;
          if (!records.length) return;
          fetchNextPage();
        }}
        onEndReachedThreshold={0.2}
      />

      <BottomSheet
        visible={!!selectedRecord}
        onDismiss={() => setSelectedRecord(null)}
      >
        <Options
          data={[
            {
              label: "Delete",
              value: selectedRecord,
              onPress: () => {
                setOpenDeletePopup(true);
              },
              icon: (
                <DeleteIcon
                  size={24}
                  weight="fill"
                  className="text-icon-negative"
                />
              ),
            },
          ]}
        />
      </BottomSheet>
      <Popup
        visible={openDeletePopup}
        onCancel={() => setOpenDeletePopup(false)}
        onConfirm={handleDelete}
        title="Remove medical record"
        description="Are you sure you want to remove this medical record?"
        variant="delete"
        loading={isDeletingMedicalRecord}
      />
    </ScreenContainer>
  );
};
