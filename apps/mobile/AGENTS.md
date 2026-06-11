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

## 2. Product Scope

`apps/mobile` is the canonical mobile app for current users.

### In scope

- Authentication
- Onboarding
- Home
- Reminders
- Services hub
- Budget
- Photos
- Medical records
- Settings
- Sitter booking
- Subscription
- Pet Care AI

### Deferred / legacy unless explicitly requested

- Store / commerce
- Clinics
- Spas
- Training

## 3. Directory Structure

- `app/` - Expo Router screens and layouts.
- `assets/` - Static assets including fonts (Nunito) and images.
- `components/ui/` - Reusable UI primitive components (Button, BottomSheet, Modal, etc.) built with NativeWind & `cva`.
- `components/` - Shared app components used across domains, such as generic controllers, feedback, media, navigation, and layout.
- `features/` - Domain screens, reusable feature components, and orchestration hooks.
- `constants/` - Constant values, API routes, and store keys.
- `hooks/` - Custom React hooks.
- `interfaces/` - TypeScript typings and interfaces.
- `services/` - Axios helpers and API endpoints (e.g., `api-helper.ts`, `ai.ts`).
- `stores/` - Zustand global state stores.
- `theme/` - Design system configuration (colors, spacing, roundness).
- `utils/` - Utility functions (e.g., formatters, validators).

## 4. Coding Conventions

- **Project UI/UX Skills:** For mobile UI work, use `.codex/skills/pet-mobile-ui-ux-design/SKILL.md` before design decisions, `.codex/skills/react-native-expo-ui-implementation/SKILL.md` while implementing, and `.codex/skills/mobile-ui-review-checklist/SKILL.md` before completion. See `../../docs/13-mobile-ui-ux-skills-guide.md`.
- **UI Components:** Use `class-variance-authority` (`cva`) for UI primitives in `components/ui`. Keep `styles.ts` containing the CVA logic separate from the `index.tsx` component logic.
- **Styling Strategy:** Use tailwind classes via the `className` prop. Strictly respect the custom theme variables and color palettes defined in `tailwind.config.js` and `theme/`.
- **API Interaction:** Always use the initialized `APIs` instance (`APIs.get()`, `APIs.post()`, etc.) exported from `services/api-helper.ts`. Responses are automatically transformed to camelCase keys via Axios interceptors.
- **State Handling:**
  - Keep UI and transient state local to the component hook.
  - Use **Zustand** primarily for persistent global app configuration (e.g., User authentication info, tokens) combined with `expo-secure-store`.
  - Use **React Query** for caching and managing server state.
- **TypeScript:** Enforce strict null checks and proper typing using `interfaces/`. Avoid `any`.
- **Imports:** Use absolute imports leveraging the `@/*` alias scheme.

## 5. Documentation Rules

Keep the docs aligned with the active Expo product.

### Required documentation priorities

1. Update `README.md` when the app scope or setup instructions change.
2. Keep `AGENTS.md` aligned with architecture and product scope.
3. Document route flow in `app/_layout.tsx` when auth/onboarding behavior changes.
4. Keep `constants/api-routes.ts` aligned with backend route families.
5. Keep `constants/query-keys.ts` aligned with feature domains and cache boundaries.

### What to document explicitly

- Active vs deferred features
- Auth/onboarding flow
- Session/token handling
- API ownership by domain
- Query key conventions
- Route groups and navigation boundaries

## 6. Development Workflow

- Run the project using `npm start` or `npx expo start`.
- Follow standard Git branching and commit practices.

## 7. Implementation Guidance

- Prefer feature-domain organization over generic screen-only organization.
- Keep `services/` focused on API transport and domain requests.
- Keep `components/` focused on cross-domain shared UI. Put feature-owned components in `features/<domain>/components`.
- If a new feature is added, document the feature domain and route behavior before or alongside the code.
- If a feature is deferred, mark it clearly in docs rather than leaving it mixed into active scope.

## 8. Mobile UI Review Rules

Target:

- iOS first

Design System:

- Orange theme (light)
- Blue theme (dark)

Check:

- Safe Area
- Bottom Sheet
- Keyboard Avoiding
- Typography Scale
- Touch Target >= 44pt
- Accessibility Labels

Review every screen:

- onboarding
- home
- pet profile
- medical record
- reminders
- photos
- budget
- settings
- sitter
- doctor ai

Always:

1. Run app.
2. Open simulator.
3. Capture screenshot.
4. Review UI.
5. Fix code.
6. Verify again.
