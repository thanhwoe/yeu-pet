import { Toast } from "@/components/Toast";
import { MEDICAL_RECORDS_KEY, PET_KEY } from "@/constants/query-keys";
import { IMedicalRecordForm } from "@/constants/validation";
import {
  IMedicalRecord,
  IMedicalRecordDetail,
  IPagination,
} from "@/interfaces";
import {
  createMedicalRecordMutation,
  deleteMedicalRecordMutation,
  getMedicalRecordDetailQuery,
  getListPetQuery,
  getMedicalRecordsByPetIdQuery,
  updateMedicalRecordMutation,
} from "@/services";
import { shortID } from "@/utils";
import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

const MEDICAL_RECORD_PAGE_SIZE = 20;
const MEDICAL_RECORD_PREVIEW_SIZE = 20;

type MedicalRecordListCache =
  | IPagination<IMedicalRecord>
  | InfiniteData<IPagination<IMedicalRecord>, number>;
type MedicalRecordListQueryParams = {
  petId?: string;
  page?: number;
  limit?: number;
};

const createdMedicalRecords = new Map<string, IMedicalRecord>();
const deletedMedicalRecordIds = new Set<string>();

const toMedicalRecordListItem = (
  record: IMedicalRecordDetail,
): IMedicalRecord => ({
  id: record.id,
  attachmentStatus: record.attachmentStatus,
  petId: record.petId,
  recordType: record.recordType,
  title: record.title,
  description: record.description,
  date: record.date,
  vetClinic: record.vetClinic,
  vetName: record.vetName,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const isInfiniteMedicalRecordCache = (
  data: MedicalRecordListCache,
): data is InfiniteData<IPagination<IMedicalRecord>, number> => {
  const maybeInfiniteData =
    data as Partial<InfiniteData<IPagination<IMedicalRecord>, number>>;

  return Array.isArray(maybeInfiniteData.pages);
};

const mergeMedicalRecordIntoPage = (
  page: IPagination<IMedicalRecord>,
  record: IMedicalRecord,
) => {
  let changed = false;
  const data = page.data.map((item) => {
    if (item.id !== record.id) {
      return item;
    }

    changed = true;
    return { ...item, ...record };
  });

  return changed ? { ...page, data } : page;
};

const getMedicalRecordListQueryParams = (
  queryKey: QueryKey,
): MedicalRecordListQueryParams | undefined => {
  const paramsEntry = queryKey[2];

  if (
    paramsEntry &&
    typeof paramsEntry === "object" &&
    "params" in paramsEntry
  ) {
    return (paramsEntry as { params?: MedicalRecordListQueryParams }).params;
  }

  return undefined;
};

const upsertMedicalRecordIntoPage = (
  page: IPagination<IMedicalRecord>,
  record: IMedicalRecord,
) => {
  const nextData = [
    record,
    ...page.data.filter((item) => item.id !== record.id),
  ];
  const limit = page.meta.limit || nextData.length;

  return {
    ...page,
    data: nextData.slice(0, limit),
    meta: {
      ...page.meta,
      total: page.data.some((item) => item.id === record.id)
        ? page.meta.total
        : page.meta.total + 1,
    },
  };
};

const removeMedicalRecordFromPage = (
  page: IPagination<IMedicalRecord>,
  id: string,
) => {
  const nextData = page.data.filter((item) => item.id !== id);

  if (nextData.length === page.data.length) {
    return page;
  }

  return {
    ...page,
    data: nextData,
    meta: {
      ...page.meta,
      total: Math.max(0, page.meta.total - 1),
    },
  };
};

const removeMedicalRecordFromInfiniteCache = (
  cache: InfiniteData<IPagination<IMedicalRecord>, number>,
  id: string,
) => {
  const records = cache.pages.flatMap((page) => page.data);

  if (!records.some((record) => record.id === id)) {
    return cache;
  }

  const nextRecords = records.filter((record) => record.id !== id);
  let cursor = 0;

  return {
    ...cache,
    pages: cache.pages.map((page) => {
      const limit =
        page.meta.limit || page.data.length || MEDICAL_RECORD_PAGE_SIZE;
      const data = nextRecords.slice(cursor, cursor + limit);
      cursor += limit;

      return {
        ...page,
        data,
        meta: {
          ...page.meta,
          total: Math.max(0, page.meta.total - 1),
        },
      };
    }),
  };
};

const rememberCreatedMedicalRecord = (record: IMedicalRecord) => {
  deletedMedicalRecordIds.delete(record.id);
  createdMedicalRecords.set(record.id, record);
};

const rememberDeletedMedicalRecord = (id: string) => {
  createdMedicalRecords.delete(id);
  deletedMedicalRecordIds.add(id);
};

const getVisibleMedicalRecords = (
  records: IMedicalRecord[],
  petId?: string,
) => {
  const visibleRecords = [
    ...Array.from(createdMedicalRecords.values()).reverse(),
    ...records,
  ];
  const seenIds = new Set<string>();

  return visibleRecords.filter((record) => {
    if (deletedMedicalRecordIds.has(record.id)) {
      return false;
    }

    if (petId && record.petId !== petId) {
      return false;
    }

    if (seenIds.has(record.id)) {
      return false;
    }

    seenIds.add(record.id);
    return true;
  });
};

const applyLocalMedicalRecordStateToPage = (
  page: IPagination<IMedicalRecord>,
  params: MedicalRecordListQueryParams,
) => {
  const visibleData = page.data.filter(
    (record) => !deletedMedicalRecordIds.has(record.id),
  );
  const removedCount = page.data.length - visibleData.length;
  const shouldPrependCreatedRecords = !params.page || params.page <= 1;

  if (!shouldPrependCreatedRecords) {
    return removedCount
      ? {
          ...page,
          data: visibleData,
          meta: {
            ...page.meta,
            total: Math.max(0, page.meta.total - removedCount),
          },
        }
      : page;
  }

  const visibleIds = new Set(visibleData.map((record) => record.id));
  const createdRecords = Array.from(createdMedicalRecords.values()).filter(
    (record) =>
      !deletedMedicalRecordIds.has(record.id) &&
      (!params.petId || record.petId === params.petId),
  );

  createdRecords.forEach((record) => {
    if (visibleIds.has(record.id)) {
      createdMedicalRecords.delete(record.id);
    }
  });

  const recordsToPrepend = createdRecords.filter(
    (record) => !visibleIds.has(record.id),
  );

  if (!recordsToPrepend.length && !removedCount) {
    return page;
  }

  const limit = params.limit || page.meta.limit || page.data.length;
  const data = [...recordsToPrepend.reverse(), ...visibleData].slice(0, limit);

  return {
    ...page,
    data,
    meta: {
      ...page.meta,
      total: Math.max(
        data.length,
        page.meta.total + recordsToPrepend.length - removedCount,
      ),
    },
  };
};

const upsertMedicalRecordListCaches = (
  queryClient: QueryClient,
  record: IMedicalRecord,
) => {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: MEDICAL_RECORDS_KEY.lists() })
    .forEach((query) => {
      const params = getMedicalRecordListQueryParams(query.queryKey);

      if (params?.petId && params.petId !== record.petId) {
        return;
      }

      if (params?.page && params.page > 1) {
        return;
      }

      queryClient.setQueryData<MedicalRecordListCache>(
        query.queryKey,
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          if (isInfiniteMedicalRecordCache(oldData)) {
            const [firstPage, ...restPages] = oldData.pages;

            if (!firstPage) {
              return oldData;
            }

            return {
              ...oldData,
              pages: [
                upsertMedicalRecordIntoPage(firstPage, record),
                ...restPages,
              ],
            };
          }

          return upsertMedicalRecordIntoPage(oldData, record);
        },
      );
    });
};

const removeMedicalRecordListCaches = (
  queryClient: QueryClient,
  id: string,
) => {
  queryClient.setQueriesData<MedicalRecordListCache>(
    { queryKey: MEDICAL_RECORDS_KEY.lists() },
    (oldData) => {
      if (!oldData) {
        return oldData;
      }

      if (isInfiniteMedicalRecordCache(oldData)) {
        return removeMedicalRecordFromInfiniteCache(oldData, id);
      }

      return removeMedicalRecordFromPage(oldData, id);
    },
  );
};

const finishMedicalRecordDelete = async (
  queryClient: QueryClient,
  id: string,
) => {
  rememberDeletedMedicalRecord(id);
  await queryClient.cancelQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });
  removeMedicalRecordListCaches(queryClient, id);
  queryClient.removeQueries({
    queryKey: MEDICAL_RECORDS_KEY.detail(id),
  });
  queryClient.invalidateQueries({
    queryKey: MEDICAL_RECORDS_KEY.lists(),
    refetchType: "none",
  });
};

const syncMedicalRecordListCaches = (
  queryClient: QueryClient,
  record: IMedicalRecordDetail,
) => {
  const listRecord = toMedicalRecordListItem(record);

  if (listRecord.attachmentStatus !== "processing") {
    createdMedicalRecords.delete(listRecord.id);
  }

  queryClient.setQueriesData<MedicalRecordListCache>(
    { queryKey: MEDICAL_RECORDS_KEY.lists() },
    (oldData) => {
      if (!oldData) {
        return oldData;
      }

      if (isInfiniteMedicalRecordCache(oldData)) {
        let changed = false;
        const pages = oldData.pages.map((page) => {
          const nextPage = mergeMedicalRecordIntoPage(page, listRecord);
          changed = changed || nextPage !== page;
          return nextPage;
        });

        return changed ? { ...oldData, pages } : oldData;
      }

      return mergeMedicalRecordIntoPage(oldData, listRecord);
    },
  );
};

export function useMedicalRecordList() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null,
  );
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: petData,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const { mutateAsync: createMedicalRecord, isPending: isCreating } =
    useMutation({
      mutationFn: createMedicalRecordMutation,
      onSuccess: (record) => {
        rememberCreatedMedicalRecord(record);
        upsertMedicalRecordListCaches(queryClient, record);
        setOpenForm(false);

        queryClient.invalidateQueries({
          queryKey: MEDICAL_RECORDS_KEY.lists(),
        });
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: async (_result, deletedId) => {
      await finishMedicalRecordDelete(queryClient, deletedId);

      setOpenDeletePopup(false);
      setSelectedRecord(null);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleOpenForm = useCallback(() => {
    if (petData?.data.length) {
      setOpenForm(true);
      return;
    }

    Toast.warn({ text: "Please add a pet first." });
  }, [petData?.data.length]);

  const handleCloseForm = useCallback(() => setOpenForm(false), []);

  const handleCreateMedicalRecord = useCallback(
    async (data: IMedicalRecordForm) => {
      await createMedicalRecord(data);
    },
    [createMedicalRecord],
  );

  const handleSelectRecord = useCallback((record: IMedicalRecord) => {
    setSelectedRecord(record);
  }, []);

  const handleClearSelectedRecord = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleOpenDeletePopup = useCallback(() => {
    setOpenDeletePopup(true);
  }, []);

  const handleCloseDeletePopup = useCallback(() => {
    setOpenDeletePopup(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRecord?.id) {
      await deleteMedicalRecord(selectedRecord.id);
    }
  }, [deleteMedicalRecord, selectedRecord?.id]);

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({
      queryKey: MEDICAL_RECORDS_KEY.lists(),
    });
  }, [queryClient, refetch]);

  return {
    isCreating,
    isDeletingMedicalRecord,
    isRefetching,
    openDeletePopup,
    openForm,
    petData,
    selectedRecord,
    handleClearSelectedRecord,
    handleCloseDeletePopup,
    handleCloseForm,
    handleCreateMedicalRecord,
    handleDelete,
    handleOpenDeletePopup,
    handleOpenForm,
    handleRefresh,
    handleSelectRecord,
  };
}

interface UseMedicalRecordDetailParams {
  id?: string;
  onDeleted?: () => void;
}

export function useMedicalRecordDetail({
  id,
  onDeleted,
}: UseMedicalRecordDetailParams) {
  const [openOptions, setOpenOptions] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: MEDICAL_RECORDS_KEY.detail(id),
    queryFn: () => getMedicalRecordDetailQuery(id ?? ""),
    enabled: !!id,
  });
  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const {
    mutateAsync: updateMedicalRecord,
    isPending: isUpdatingMedicalRecord,
  } = useMutation({
    mutationFn: updateMedicalRecordMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEY.detail(id),
      });
      setOpenEditForm(false);
      setOpenOptions(false);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: async (_result, deletedId) => {
      await finishMedicalRecordDelete(queryClient, deletedId);

      setOpenDeletePopup(false);
      setOpenOptions(false);
      onDeleted?.();
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleOpenOptions = useCallback(() => setOpenOptions(true), []);
  const handleCloseOptions = useCallback(() => setOpenOptions(false), []);
  const handleOpenEditForm = useCallback(() => setOpenEditForm(true), []);
  const handleCloseEditForm = useCallback(() => setOpenEditForm(false), []);
  const handleOpenDeletePopup = useCallback(() => setOpenDeletePopup(true), []);
  const handleCloseDeletePopup = useCallback(
    () => setOpenDeletePopup(false),
    [],
  );

  const handleDelete = useCallback(async () => {
    if (data?.id) {
      await deleteMedicalRecord(data.id);
    }
  }, [data?.id, deleteMedicalRecord]);

  const handleUpdateMedicalRecord = useCallback(
    async (payload: IMedicalRecordForm) => {
      if (data?.id) {
        await updateMedicalRecord({
          id: data.id,
          ...payload,
        });
      }
    },
    [data?.id, updateMedicalRecord],
  );

  const recordImages = useMemo(
    () => data?.medicalAttachments.map((attachment) => attachment.url) ?? [],
    [data?.medicalAttachments],
  );
  const petName = useMemo(
    () => petData?.data.find((pet) => pet.id === data?.petId)?.name,
    [data?.petId, petData?.data],
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    syncMedicalRecordListCaches(queryClient, data);
  }, [data, queryClient]);

  const defaultValues: IMedicalRecordForm | undefined = useMemo(() => {
    if (!data) {
      return;
    }

    return {
      petId: data.petId,
      recordType: data.recordType,
      title: data.title,
      date: dayjs(data.date).toDate(),
      description: data.description ?? "",
      vetClinic: data.vetClinic ?? "",
      vetName: data.vetName ?? "",
      attachmentIds: data.medicalAttachments.map((attachment) => ({
        id: attachment.id,
        url: attachment.thumbnailUrl,
        name: `Attachment ${shortID(attachment.id)}`,
      })),
    };
  }, [data]);

  return {
    data,
    defaultValues,
    isDeletingMedicalRecord,
    isLoading,
    isUpdatingMedicalRecord,
    openDeletePopup,
    openEditForm,
    openOptions,
    petName,
    recordImages,
    handleCloseDeletePopup,
    handleCloseEditForm,
    handleCloseOptions,
    handleDelete,
    handleOpenDeletePopup,
    handleOpenEditForm,
    handleOpenOptions,
    handleUpdateMedicalRecord,
  };
}

export function useMedicalRecordPetList(petId?: string) {
  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null,
  );
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: MEDICAL_RECORDS_KEY.list({
      petId,
      limit: MEDICAL_RECORD_PAGE_SIZE,
    }),
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam) || 1;
      const response = await getMedicalRecordsByPetIdQuery({
        petId: petId ?? "",
        page,
        limit: MEDICAL_RECORD_PAGE_SIZE,
      });

      return applyLocalMedicalRecordStateToPage(response, {
        petId,
        page,
        limit: MEDICAL_RECORD_PAGE_SIZE,
      });
    },
    enabled: !!petId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;
      return lastPage.meta.page + 1;
    },
  });

  const records = useMemo(
    () => getVisibleMedicalRecords(
      data?.pages.flatMap((page) => page.data) ?? [],
      petId,
    ),
    [data, petId],
  );

  const {
    mutateAsync: deleteMedicalRecord,
    isPending: isDeletingMedicalRecord,
  } = useMutation({
    mutationFn: deleteMedicalRecordMutation,
    onSuccess: async (_result, deletedId) => {
      await finishMedicalRecordDelete(queryClient, deletedId);

      setOpenDeletePopup(false);
      setSelectedRecord(null);
    },
    onError: (error) => {
      Toast.error({ text: error.message });
    },
  });

  const handleSelectRecord = useCallback((record: IMedicalRecord) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseRecordOptions = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleOpenDeletePopup = useCallback(() => {
    setOpenDeletePopup(true);
  }, []);

  const handleCloseDeletePopup = useCallback(() => {
    setOpenDeletePopup(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRecord?.id) {
      await deleteMedicalRecord(selectedRecord.id);
    }
  }, [deleteMedicalRecord, selectedRecord?.id]);

  return {
    hasNextPage,
    isDeletingMedicalRecord,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    openDeletePopup,
    records,
    selectedRecord,
    fetchNextPage,
    handleCloseDeletePopup,
    handleCloseRecordOptions,
    handleDelete,
    handleOpenDeletePopup,
    handleSelectRecord,
    refetch,
  };
}

export function useMedicalRecordPreview(petId: string, enabled: boolean) {
  return useQuery({
    queryKey: MEDICAL_RECORDS_KEY.list({
      petId,
      page: 1,
      limit: MEDICAL_RECORD_PREVIEW_SIZE,
    }),
    queryFn: async () => {
      const response = await getMedicalRecordsByPetIdQuery({
        petId,
        page: 1,
        limit: MEDICAL_RECORD_PREVIEW_SIZE,
      });

      return applyLocalMedicalRecordStateToPage(response, {
        petId,
        page: 1,
        limit: MEDICAL_RECORD_PREVIEW_SIZE,
      });
    },
    enabled,
  });
}
