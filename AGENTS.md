# AI Agents Guidelines for Pet Care (Pet Land)

Welcome! You are an AI agent working on the `pet-care` (Pet Land) repository. Please adhere to the following guidelines, conventions, and architectural rules when proposing or making code changes.

## 1. Tech Stack Overview

- **Framework**: React Native with Expo (SDK ~53.0)
- **Routing**: Expo Router v3 (file-based routing via `app/` directory)
- **Styling**: NativeWind v4 (TailwindCSS v3.4.x)
- **State Management**: Zustand (persisted via `expo-secure-store`)
- **Data Fetching**: Axios & React Query (`@tanstack/react-query` v5)
- **Forms**: React Hook Form with Zod validation (`@hookform/resolvers`)
- **Icons**: Phosphor Icons (`phosphor-react-native`) & `@expo/vector-icons`
- **Charts**: Victory Native (`victory-native`)
- **Animation**: React Native Reanimated

## 2. Directory Structure

- `app/` - Expo Router screens and layouts.
- `assets/` - Static assets including fonts (Nunito) and images.
- `components/ui/` - Reusable UI primitive components (Button, BottomSheet, Modal, etc.) built with NativeWind & `cva`.
- `components/` - Feature-specific components (e.g., `PetCardCarousel`, `BudgetCategoryForm`).
- `constants/` - Constant values, API routes, and store keys.
- `hooks/` - Custom React hooks.
- `interfaces/` - TypeScript typings and interfaces.
- `services/` - Axios helpers and API endpoints (e.g., `api-helper.ts`, `ai.ts`).
- `stores/` - Zustand global state stores.
- `theme/` - Design system configuration (colors, spacing, roundness).
- `utils/` - Utility functions (e.g., formatters, validators).

## 3. Coding Conventions

- **UI Components:** Use `class-variance-authority` (`cva`) for UI primitives in `components/ui`. Keep `styles.ts` containing the CVA logic separate from the `index.tsx` component logic.
- **Styling Strategy:** Use tailwind classes via the `className` prop. Strictly respect the custom theme variables and color palettes defined in `tailwind.config.js` and `theme/`.
- **API Interaction:** Always use the initialized `APIs` instance (`APIs.get()`, `APIs.post()`, etc.) exported from `services/api-helper.ts`. Responses are automatically transformed to camelCase keys via Axios interceptors.
- **State Handling:**
  - Keep UI and transient state local to the component hook.
  - Use **Zustand** primarily for persistent global app configuration (e.g., User authentication info, tokens) combined with `expo-secure-store`.
  - Use **React Query** for caching and managing server state.
- **TypeScript:** Enforce strict null checks and proper typing using `interfaces/`. Avoid `any`.
- **Imports:** Use absolute imports leveraging the `@/*` alias scheme.

## 4. Development Workflow

- Run the project using `npm start` or `npx expo start`.
- Follow standard Git branching and commit practices.
