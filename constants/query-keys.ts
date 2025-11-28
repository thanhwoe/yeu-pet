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

export const BUDGET_TRANSACTION_KEY = {
  all: [{ scope: "budget-transaction" }] as const,
  lists: () => [...BUDGET_TRANSACTION_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...BUDGET_TRANSACTION_KEY.lists(), { params }] as const,
  details: () => [...BUDGET_TRANSACTION_KEY.all, "detail"] as const,
  detail: (id?: number) => [...BUDGET_TRANSACTION_KEY.details(), id] as const,
};

export const BUDGET_KEY = {
  all: [{ scope: "budget" }] as const,
  lists: () => [...BUDGET_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...BUDGET_KEY.lists(), { params }] as const,
  details: () => [...BUDGET_KEY.all, "detail"] as const,
  detail: (id?: number) => [...BUDGET_KEY.details(), id] as const,
};

export const CHART_KEY = {
  all: [{ scope: "chart" }] as const,
  lists: () => [...CHART_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...CHART_KEY.lists(), { params }] as const,
  details: () => [...CHART_KEY.all, "detail"] as const,
  detail: (id?: number) => [...CHART_KEY.details(), id] as const,
};

export const PHOTOS_KEY = {
  all: [{ scope: "photos" }] as const,
  lists: () => [...PHOTOS_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...PHOTOS_KEY.lists(), { params }] as const,
  details: () => [...PHOTOS_KEY.all, "detail"] as const,
  detail: (id?: number | string) => [...PHOTOS_KEY.details(), id] as const,
};

export const PRODUCTS_KEY = {
  all: [{ scope: "products" }] as const,
  lists: () => [...PRODUCTS_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...PRODUCTS_KEY.lists(), { params }] as const,
  details: () => [...PRODUCTS_KEY.all, "detail"] as const,
  detail: (id?: number | string) => [...PRODUCTS_KEY.details(), id] as const,
};
