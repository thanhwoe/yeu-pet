import { SITTER_KEY } from "@/constants/query-keys";
import { type SitterFilters } from "@/interfaces";
import { getSittersQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";

const SITTER_EXPLORE_LIMIT = 10;

export const useSitterExplore = (
  filters: SitterFilters = {},
  filterRevision = 0,
) => {
  const sittersQuery = useQuery({
    queryKey: SITTER_KEY.list({
      limit: SITTER_EXPLORE_LIMIT,
      ...filters,
      filterRevision,
    }),
    queryFn: () =>
      getSittersQuery({ limit: SITTER_EXPLORE_LIMIT, ...filters }),
  });

  return {
    sitters: sittersQuery.data?.data ?? [],
    isLoading: sittersQuery.isLoading,
    isError: sittersQuery.isError,
    isRefreshing: sittersQuery.isRefetching,
    refetch: sittersQuery.refetch,
  };
};
