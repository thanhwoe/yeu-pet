type IQueryParams = Record<string, any>;

export const PET_KEY = {
  all: [{ scope: "pet" }] as const,
  lists: () => [...PET_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...PET_KEY.lists(), { params }] as const,
  details: () => [...PET_KEY.all, "detail"] as const,
  detail: (id?: number) => [...PET_KEY.details(), id] as const,
};
