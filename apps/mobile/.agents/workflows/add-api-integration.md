---
description: How to add a new API integration and global state feature
---

# API Integration & Data Fetching Workflow

Use this workflow to add a new API integration and handle its global state fetching using React Query or Zustand.

## 1. Add API Routes
Add the new API paths to `constants/api-routes.ts`. Group the endpoints properly within the existing structure.

## 2. Define TypeScript Interfaces
Create standard response/request interfaces in the `interfaces/` folder (e.g., `interfaces/order.ts`). Make sure the fields are in `camelCase` because `services/api-helper.ts` automatically transforms responses.

## 3. Create Service Method
Navigate to the `services/` directory and create or update the relevant service file (e.g., `services/order.ts`).
**Rule:** ALWAYS use the `APIs` instance exported from `services/api-helper.ts`!

```typescript
import { APIs } from "./api-helper";
import { API_ROUTES } from "@/constants/api-routes";
import { IOrderResponse } from "@/interfaces/order";

export const getOrders = async () => {
  const { data } = await APIs.get<{ data: IOrderResponse[] }>(API_ROUTES.GET_ORDERS);
  return data;
};
```

## 4. Query with React Query (Recommended)
Within your React Native component or a dedicated custom hook (e.g., `hooks/useOrders.ts`), utilize `@tanstack/react-query` to fetch the data.

```typescript
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/services/order";

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
};
```

## 5. Handle Persistent Data (If Applicable)
If the fetched data signifies global configuration or user tokens rather than server state, use Zustand to store it. Navigate to `stores/` and create/update the necessary Zustand store leveraging `expo-secure-store` for persistence.
