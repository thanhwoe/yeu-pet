import { SITTER_KEY } from "@/constants/query-keys";
import { getSittersQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";

const SITTER_LIMIT = 10;

export const useSitters = () => {
  const sittersQuery = useQuery({
    queryKey: SITTER_KEY.list({ limit: SITTER_LIMIT }),
    queryFn: () => getSittersQuery({ limit: SITTER_LIMIT }),
  });

  return {
    sitters: sittersQuery.data?.data ?? [],
    isLoading: sittersQuery.isLoading,
    isError: sittersQuery.isError,
    refetch: sittersQuery.refetch,
  };
};
