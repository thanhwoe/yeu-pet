# YeuPet Mobile Refactor Documentation Pack

This documentation pack is for the next mobile frontend refactor of the YeuPet React Native + Expo app.

> Reference pack: these files preserve the imported refactor guidance. Do not treat checklist status here as the current completion state; use `docs/mobile-fe-implementation-checklist.md`, `apps/mobile/docs/mobile-refactor-plan.md`, and `apps/mobile/docs/mobile-refactor-audit.md` for active project status.

The goal is to help the coding agent refactor the mobile folder structure, clean up reusable components, align screens with the finalized Phase 1 backend APIs, and improve UI/UX quality without touching out-of-scope Phase 2 features.

## Current project context

- Monorepo package manager: `pnpm`
- Mobile app path: `apps/mobile`
- Mobile stack:
  - React Native + Expo SDK 53
  - Expo Router
  - NativeWind
  - TanStack React Query
  - Axios
  - Zustand
  - React Hook Form + Zod
  - Gorhom Bottom Sheet
  - FlashList
  - Expo Image / Image Picker / Notifications / Secure Store
- Backend API contract is already finalized.
- The mobile app currently has mixed structure: `app/`, `screens/`, `components/`, `features/`, `services/`, `interfaces/`, `stores/`, `theme/`, etc.
- Some screens/components belong to Phase 2 or out-of-scope features and must be skipped in this refactor.

## Refactor strategy

Do not perform a risky big-bang refactor. Work in controlled phases:

1. Audit current mobile structure and endpoint usage.
2. Freeze out-of-scope features.
3. Create/refactor folder architecture.
4. Build UI foundation and component rules.
5. Refactor Phase 1 feature modules one by one.
6. Integrate canonical backend APIs.
7. Run visual, functional, and API QA.

## Documentation files

Read these files in order:

1. `AGENT_MASTER_PROMPT.md`
2. `docs/01-refactor-goals-and-boundaries.md`
3. `docs/02-target-folder-structure.md`
4. `docs/03-component-refactor-spec.md`
5. `docs/04-ui-foundation-spec.md`
6. `docs/05-feature-module-spec.md`
7. `docs/06-phase1-screen-spec.md`
8. `docs/07-api-integration-spec.md`
9. `docs/08-out-of-scope-policy.md`
10. `docs/09-implementation-checklist.md`
11. `docs/10-qa-and-review-checklist.md`

## Mandatory agent rules

- Do not refactor Phase 2/out-of-scope screens unless required to keep the app compiling.
- Do not change backend APIs.
- Do not add WebSocket.
- Do not call AI providers directly from mobile.
- Do not scatter raw `axios` calls inside screens.
- Do not send `accountId` from mobile request bodies.
- Do not hardcode colors in feature screens.
- Do not introduce new libraries unless clearly justified.
- Keep Expo Router route files thin.
- Prefer feature modules and shared UI primitives.
- Keep server state in React Query, not Zustand.
- Use Zustand only for client-only app/session/UI state.

## Success criteria

The refactor is successful when:

- Phase 1 screens use canonical backend endpoints.
- Legacy endpoint usage is removed or documented.
- Components are organized into `ui`, shared/common, and feature-specific components.
- The folder structure is clear and scalable.
- Screens have loading, empty, error, and mutation states.
- Theme/light/dark mode is consistent.
- Forms use React Hook Form + Zod.
- Lists use FlashList where appropriate.
- Lint/type checks pass.
- The agent provides a clear final report with changed files, skipped areas, known issues, and next steps.
