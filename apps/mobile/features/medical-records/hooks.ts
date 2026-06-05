import { Toast } from "@/components/Toast";
import { MEDICAL_RECORDS_KEY, PET_KEY } from "@/constants/query-keys";
import { IMedicalRecordForm } from "@/constants/validation";
import { IMedicalRecord } from "@/interfaces";
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
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

const MEDICAL_RECORD_PAGE_SIZE = 20;
const MEDICAL_RECORD_PREVIEW_SIZE = 20;

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
      onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEY.lists() });

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
    queryFn: ({ pageParam }) =>
      getMedicalRecordsByPetIdQuery({
        petId: petId ?? "",
        page: pageParam,
        limit: MEDICAL_RECORD_PAGE_SIZE,
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
    queryFn: () =>
      getMedicalRecordsByPetIdQuery({
        petId,
        page: 1,
        limit: MEDICAL_RECORD_PREVIEW_SIZE,
      }),
    enabled,
  });
}
