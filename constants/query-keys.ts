type IQueryParams = Record<string, any>;

export const PET_KEY = {
  all: [{ scope: "pet" }] as const,
  lists: () => [...PET_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...PET_KEY.lists(), { params }] as const,
  details: () => [...PET_KEY.all, "detail"] as const,
  detail: (id?: number) => [...PET_KEY.details(), id] as const,
};

export const CLINIC_KEY = {
  all: [{ scope: "clinic" }] as const,
  lists: () => [...CLINIC_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...CLINIC_KEY.lists(), { params }] as const,
  details: () => [...CLINIC_KEY.all, "detail"] as const,
  detail: (id?: number) => [...CLINIC_KEY.details(), id] as const,
};

export const REMINDER_KEY = {
  all: [{ scope: "reminder" }] as const,
  lists: () => [...REMINDER_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...REMINDER_KEY.lists(), { params }] as const,
  details: () => [...REMINDER_KEY.all, "detail"] as const,
  detail: (id?: number) => [...REMINDER_KEY.details(), id] as const,
};
