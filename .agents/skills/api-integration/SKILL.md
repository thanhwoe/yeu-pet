---
name: api-integration
description: Comprehensive workflow for integrating an API, from Services via Axios to Global State React Query Hooks.
---

# API Integration & Data Fetching Skill

The purpose of this skill is to ensure client-server communication remains consistent in terms of TypeScript Interfaces, Error Handling, and State Management.

## 1. Define Types & Routes
1. Create or update a file in the `interfaces/` directory for your module (e.g., `interfaces/index.ts` defining `IBudgetCategory`). Ensure keys are always strictly `camelCase`.
2. Append the new route path to the `API_ROUTES` object in `constants/api-routes.ts`.

## 2. API Helper Service (`services/`)
Create a module (e.g., `services/budget.ts`) utilizing the global pre-configured Axios client.

Example pulled from `services/budget.ts`:
```typescript
import { APIs } from "./api-helper";
import { API_ROUTES } from "@/constants/api-routes";
import { IBudgetCategory, IPagination } from "@/interfaces";
import { parseQueryParams } from "@/utils";

// Types mapping directly to backend interfaces
interface IBudgetCategoryQuery {
  limit?: number;
  page?: number;
}

export const getBudgetCategoryQuery = (params: IBudgetCategoryQuery) =>
  APIs.get<IPagination<IBudgetCategory>>(API_ROUTES.BUDGET_CATEGORIES, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const createBudgetCategoryMutation = (params: IBudgetCategoryForm) =>
  APIs.post<IBudgetCategory>(API_ROUTES.BUDGET_CATEGORIES, { data: params });
```
*Note: The `APIs` client automatically injects the `Bearer token` from Zustand and maps response payload to `camelCase`.*

## 3. Data Caching with React Query (`screens/` or `hooks/`)
Utilize `@tanstack/react-query` alongside the query keys defined in `constants/query-keys.ts` to fetch and mutate server state cleanly.

Example utilized in `screens/BudgetCategories/index.tsx`:
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgetCategoryQuery, createBudgetCategoryMutation } from "@/services";
import { BUDGET_CATEGORY_KEY } from "@/constants/query-keys";

// Fetching
const { data: categories, isLoading } = useQuery({
  queryKey: BUDGET_CATEGORY_KEY.list({ limit: 20 }),
  queryFn: () => getBudgetCategoryQuery({ limit: 20 }),
});

// Mutating Data
const queryClient = useQueryClient();

const { mutateAsync: createCategory } = useMutation({
  mutationFn: createBudgetCategoryMutation,
  onSuccess: () => {
    // Force refetch to update local state
    queryClient.invalidateQueries({
      queryKey: BUDGET_CATEGORY_KEY.lists(),
    });
  },
});
```

**Zustand Rule:** NEVER use Zustand or Context API for simple remote data fetching. Rely entirely on React Query for caching server state, reserving Zustand ONLY for local app preferences and secure token storage (`stores/user-info.ts`).
