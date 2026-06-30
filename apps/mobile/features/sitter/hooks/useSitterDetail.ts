import { SITTER_KEY } from "@/constants/query-keys";
import { getSitterDetailQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";

export const useSitterDetail = (sitterId?: string) => {
  const sitterDetailQuery = useQuery({
    queryKey: SITTER_KEY.detail(sitterId),
    queryFn: () => getSitterDetailQuery(sitterId ?? ""),
    enabled: Boolean(sitterId),
  });

  return {
    sitter: sitterDetailQuery.data ?? null,
    isLoading: sitterDetailQuery.isLoading,
    isError: sitterDetailQuery.isError,
    refetch: sitterDetailQuery.refetch,
  };
};
