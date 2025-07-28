export interface IPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}
