# Mobile Code Conventions

These conventions keep the Expo app incremental, predictable, and aligned with the project-local UI/UX skills in `../../.codex/skills`.

For mobile UI tasks, use `pet-mobile-ui-ux-design` before design decisions, `react-native-expo-ui-implementation` while coding, and `mobile-ui-review-checklist` before marking the task complete. See `../../docs/13-mobile-ui-ux-skills-guide.md`.

## Folder Ownership

- `app/`: Expo Router route files and layouts. Prefer thin route shims that import from `features/<domain>/screens/*` when a feature screen has been moved; `screens/*` remains acceptable for domains not migrated yet.
- `screens/`: transitional screen composition for domains not yet moved. Do not add new reusable feature components here; move them to `features/<domain>/components`.
- `features/`: domain screens, orchestration hooks, reusable feature components, default-value mapping, cache invalidation, and cross-screen feature logic.
- `components/ui/`: generic UI primitives only. These should not know about pets, sitters, budget, reminders, or backend domains.
- `components/`: shared app components used by multiple domains, such as feedback, generic forms/controllers, navigation helpers, media, and layout. Avoid placing feature-owned components here.
- `services/`: API request functions only. Use `APIs` and `API_ROUTES`; do not inline paths in screens.
- `interfaces/`: frontend response/form types. Prefer explicit domain files and export through `interfaces/index.ts`.
- `theme/`: tokens for colors, fonts, spacing, radius, and shadows.

## Import Rules

- Use `@/*` absolute imports across app boundaries.
- Relative imports are acceptable only inside the same folder or immediate feature subfolder.
- Avoid `../../` cross-boundary imports. Move shared code to the appropriate folder instead.
- Keep service files importing `./api-helper` locally and app code importing services through `@/services`.

## Screens And Hooks

- A screen should mostly compose UI, navigation options, and screen-local layout.
- Move orchestration into `features/<domain>/use*.ts` when a screen has multiple queries/mutations, cache updates, or form default mapping.
- Hooks should return stable handlers where practical with `useCallback`.
- Hooks may show toasts for mutation errors when the behavior is domain-level and reused by the screen.
- Keep React Query for server state and Zustand for durable app/session state.

## UI Components

- Use `components/ui` primitives for buttons, typography, inputs, sheet containers, avatars, state views, and other generic building blocks.
- Keep feature-specific copy, API state, and domain rules out of `components/ui`.
- Put feature-specific components in `features/<domain>/components`, even if currently consumed by only one route.
- Use `StateView` for standard loading, empty, and error states before creating one-off empty views.
- Keep tap targets at least 44px where controls are directly interactive.

## Styling

- Prefer NativeWind classes backed by `theme/*` tokens.
- Use spacing values from the existing scale and favor 4/8-point increments.
- Use semantic colors like `bg-background-card`, `text-text-tertiary-inverse`, and `border-line-secondary`.
- Avoid raw colors except where native APIs require concrete values, such as icon fill colors or platform shadow styles.
- Use shadow tokens from `theme/shadows.ts`; pair them with elevation classes deliberately for Android.
- Use `nativeShadows` from `theme/shadows.ts` for React Native `style` objects that need native shadow/elevation values.
- Prefer semantic depth names: `card` for repeated cards, `floating` for selected controls/FAB-style elements, and `tabBar` for bottom navigation.

## API And Query Keys

- Add route constants to `constants/api-routes.ts` before adding service calls.
- Add query keys to `constants/query-keys.ts` before wiring React Query.
- Service functions should parse query params with `parseQueryParams` for paginated/filterable endpoints.
- Keep response shape expectations in interfaces, not inline screen types.

## Current Audit Notes

- `components/ui` now contains primitive-level building blocks only in active code. `ThemeToggle` moved to `features/settings/components` because it owns app behavior.
- Cross-boundary import audit found no `../../` imports in active app code.
- `features/` now contains migrated components and hooks for auth, settings, pets, reminders, medical records, budget, photos, AI, subscriptions, and sitter. Continue moving large screen logic incrementally.
- Shadow setup has been reworked to use warmer app-tinted values. Direct `shadowColor: "#000"` usage has been replaced in audited active/deferred mobile UI.
