# 01 — Refactor Goals and Boundaries

## Why this refactor exists

The current mobile app has working or partially working UI, but the structure is becoming difficult to scale:

- Route files, screens, components, services, interfaces, and feature folders overlap.
- Some feature-specific components live in global `components/`.
- Some Phase 2/out-of-scope screens still exist in the app tree.
- API usage may be scattered or may still target old backend endpoints.
- UI quality is inconsistent because components are not clearly separated into primitives, shared patterns, and feature-specific components.

The goal is to make the mobile app easier for agents and developers to understand, modify, and test.

## Non-goals

This refactor must not become a full rewrite.

Do not:

- Rewrite every screen at once.
- Change backend contracts.
- Redesign the database.
- Implement WebSocket.
- Implement ecommerce/payment features.
- Add new UI libraries.
- Remove native folders unless explicitly required.
- Break Phase 1 routes.

## Phase 1 product focus

The app should focus on a practical pet-care MVP:

- Pet profiles are the core data layer.
- Reminders create retention.
- Medical Records create health/trust value.
- Budget gives supporting insight.
- Photos Social adds emotional engagement.
- Sitter Booking is a connection platform, not payment marketplace yet.
- Pet Care AI should call backend only and position itself as guidance, not a veterinarian replacement.
- Settings and subscriptions must support real product behavior.

## Refactor boundary by folder

### `apps/mobile/app`

Keep route files here. Route files should be thin and only compose/import screens from feature modules.

Good:

```tsx
export { SettingsScreen as default } from '@/features/settings/screens/SettingsScreen';
```

Bad:

```tsx
// Huge route file with API calls, form logic, styles, and business logic.
```

### `apps/mobile/screens`

This folder currently contains many screen implementations. During refactor, Phase 1 screens should gradually move into `src/features/<feature>/screens` or `features/<feature>/screens`, depending on current project alias conventions.

Do not move all screens blindly. Move only Phase 1 screens.

### `apps/mobile/components`

This currently contains mixed UI primitives, form controllers, feature components, chart components, and app-specific components.

Refactor into clear groups:

- UI primitives
- shared app components
- form controllers
- media components
- feedback components
- feature-specific components

### `apps/mobile/features`

This should become the home for Phase 1 feature modules.

Existing feature folders should be audited and either completed or aligned with the target structure.

### `apps/mobile/services`

Should not contain random feature API logic after refactor. API calls should move to `src/api` or feature-specific API files with a consistent pattern.

### `apps/mobile/interfaces`

Should be replaced or reduced in favor of colocated feature `types.ts` files or shared `types/` when truly global.

### `apps/mobile/stores`

Keep only client-only global state here, such as auth session, theme preference, local app settings, UI flags. Do not store server data that belongs in React Query.

## Required development behavior

Before changing files, the agent must:

1. Identify whether the file belongs to Phase 1.
2. Decide whether the file is UI primitive, shared app component, or feature-specific.
3. Check all imports before moving.
4. Move in small batches.
5. Run lint/typecheck after risky moves.
6. Update docs/checklist.

## Definition of done

A refactored feature is done only when:

- It uses canonical backend endpoints.
- It has feature-level API hooks.
- It uses shared UI primitives where appropriate.
- It has loading/empty/error states.
- It handles mutation pending and error states.
- It supports light/dark theme.
- It avoids old endpoint paths.
- It does not depend on out-of-scope modules.
