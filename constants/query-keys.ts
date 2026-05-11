type IQueryParams = Record<string, any>;

export const USER_KEY = {
  all: [{ scope: "user" }] as const,
  lists: () => [...USER_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...USER_KEY.lists(), { params }] as const,
  details: () => [...USER_KEY.all, "detail"] as const,
  detail: (id?: string) => [...USER_KEY.details(), id] as const,
};

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

export const BUDGET_CATEGORY_KEY = {
  all: [{ scope: "budget-category" }] as const,
  lists: () => [...BUDGET_CATEGORY_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...BUDGET_CATEGORY_KEY.lists(), { params }] as const,
  details: () => [...BUDGET_CATEGORY_KEY.all, "detail"] as const,
  detail: (id?: number) => [...BUDGET_CATEGORY_KEY.details(), id] as const,
};

export const BUDGET_KEY = {
  all: [{ scope: "budget" }] as const,
  lists: () => [...BUDGET_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...BUDGET_KEY.lists(), { params }] as const,
  details: () => [...BUDGET_KEY.all, "detail"] as const,
  detail: (id?: number | string) => [...BUDGET_KEY.details(), id] as const,
};

export const BUDGET_STATISTIC_KEY = {
  all: [{ scope: "budget-statistic" }] as const,
  lists: () => [...BUDGET_STATISTIC_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...BUDGET_STATISTIC_KEY.lists(), { params }] as const,
  details: () => [...BUDGET_STATISTIC_KEY.all, "detail"] as const,
  detail: (id?: number | string) =>
    [...BUDGET_STATISTIC_KEY.details(), id] as const,
};

export const MEDICAL_RECORDS_KEY = {
  all: [{ scope: "medical-record" }] as const,
  lists: () => [...MEDICAL_RECORDS_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...MEDICAL_RECORDS_KEY.lists(), { params }] as const,
  details: () => [...MEDICAL_RECORDS_KEY.all, "detail"] as const,
  detail: (id?: number | string) =>
    [...MEDICAL_RECORDS_KEY.details(), id] as const,
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

export const CART_KEY = {
  all: [{ scope: "cart" }] as const,
  lists: () => [...CART_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...CART_KEY.lists(), { params }] as const,
  details: () => [...CART_KEY.all, "detail"] as const,
  detail: (id?: number | string) => [...CART_KEY.details(), id] as const,
  count: () => [...CART_KEY.all, "count"] as const,
};

export const ORDER_KEY = {
  all: [{ scope: "order" }] as const,
  lists: () => [...ORDER_KEY.all, "list"] as const,
  list: (params?: IQueryParams) => [...ORDER_KEY.lists(), { params }] as const,
  details: () => [...ORDER_KEY.all, "detail"] as const,
  detail: (id?: number | string) => [...ORDER_KEY.details(), id] as const,
};

export const SHIPPING_ADDRESS_KEY = {
  all: [{ scope: "shipping-address" }] as const,
  lists: () => [...SHIPPING_ADDRESS_KEY.all, "list"] as const,
  list: (params?: IQueryParams) =>
    [...SHIPPING_ADDRESS_KEY.lists(), { params }] as const,
  details: () => [...SHIPPING_ADDRESS_KEY.all, "detail"] as const,
  detail: (id?: number | string) =>
    [...SHIPPING_ADDRESS_KEY.details(), id] as const,
};
