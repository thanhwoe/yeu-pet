# Agent Master Prompt — YeuPet Mobile Refactor

You are working on the YeuPet mobile app inside a pnpm monorepo.

## Project paths

- Mobile app: `apps/mobile`
- Expo Router routes: `apps/mobile/app`
- Current screen implementations: `apps/mobile/screens`
- Current components: `apps/mobile/components`
- Existing feature folders: `apps/mobile/features`
- Backend app: `apps/api`

## Mission

Refactor the mobile app folder structure and components carefully, then integrate/refactor Phase 1 screens using the finalized backend API contract.

This is a production-quality refactor task. Do not randomly move files or restyle screens. Work from audit → plan → implementation → verification.

## Phase 1 feature scope

Only refactor and implement these Phase 1 areas:

1. Auth/account/profile
2. Settings
3. Subscriptions and entitlement gating
4. Pet Management
5. Reminders
6. Medical Records
7. Budget Statistics
8. Photos Social
9. Sitter Booking
10. Sitter Booking Messages via HTTP only
11. Pet Care AI through backend API only
12. Notifications/devices
13. Home screen

## Out of scope for this task

Skip these unless needed to keep imports/routes compiling:

- Store/ecommerce
- Products
- Cart
- Checkout
- Shipping address
- Grooming/clinic appointment screens
- Clinic/spa listing screens
- Training documents/screens
- Events
- SOS
- VNPAY/payment modules
- Web admin portal
- WebSocket chat
- In-app payment for sitter booking

## Must-read docs before coding

Read this documentation pack in order:

1. `README.md`
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

Also read the backend API contract document in the project, usually named one of:

- `docs/12-mobile-api-contract.md`
- `docs/api-contract-phase1.md`
- `docs/mobile-api-contract.md`

Use the latest backend API contract as the source of truth.

## Required first action

Before coding, create or update:

```txt
apps/mobile/docs/mobile-refactor-audit.md
apps/mobile/docs/mobile-refactor-plan.md
```

The audit must include:

- current folder structure issues
- components that are reusable vs feature-specific
- screens that are Phase 1 vs out of scope
- legacy endpoint usage
- duplicated state/API logic
- theme/hardcoded color issues
- risky imports/circular dependency risks

The plan must include:

- exact migration phases
- files/folders to create
- files/folders to move
- files to leave untouched
- API modules to create/refactor
- component groups to refactor
- verification commands

## Implementation order

Follow this order strictly:

1. Audit and plan.
2. Create/confirm target folder structure.
3. Refactor API client and query key foundation.
4. Refactor shared UI foundation components.
5. Refactor Settings first.
6. Refactor Home + Pet Management.
7. Refactor Reminders.
8. Refactor Medical Records.
9. Refactor Budget.
10. Refactor Photos Social.
11. Refactor Sitter Booking + HTTP messages.
12. Refactor Pet Care AI.
13. Refactor Notifications/devices.
14. Final legacy endpoint cleanup.
15. QA and final report.

Do not jump directly into all screens.

## Technical rules

- Use TypeScript.
- Use Expo Router route files as thin entry points.
- Use feature modules for Phase 1 business features.
- Use centralized API modules.
- Use React Query for server state.
- Use Zustand only for client-only state.
- Use React Hook Form + Zod for forms.
- Use existing theme system; improve it only if needed.
- Avoid hardcoded colors in screens.
- Use existing dependencies. Do not add new libraries unless absolutely necessary.
- Avoid direct `@google/genai` usage in mobile.
- Keep sitter messages on HTTP list/create endpoints.
- Support light/dark/system theme.
- Add loading, empty, error, and pending states for major screens.

## Final report required

At the end, report:

1. Folder structure changes
2. Components moved/refactored
3. Feature modules created/refactored
4. Screens refactored
5. API modules integrated
6. Legacy endpoints removed/replaced
7. Out-of-scope files intentionally skipped
8. Theme/UI foundation changes
9. Lint/typecheck/run results
10. Known issues
11. Recommended next task
