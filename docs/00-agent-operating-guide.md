# 00 — Agent Operating Guide

## 1. Goal

This document gives the coding agent a safe operating process for refactoring the project.

The project is not only a coding task. It is a startup MVP. The agent must preserve product direction, business constraints, and future scalability.

## 2. Execution sequence

```txt
Phase A — Discovery
Phase B — Database redesign
Phase C — Backend API refactor/implementation
Phase D — Mobile FE refactor/implementation
Phase E — Testing, QA, documentation
```

## 3. Phase A — Discovery checklist

- [ ] Read README and all docs.
- [ ] Inspect `pnpm-workspace.yaml`.
- [ ] Inspect root `package.json` scripts.
- [ ] Inspect `apps/api/package.json`.
- [ ] Inspect `apps/mobile/package.json`.
- [ ] Inspect current Prisma schema and migrations.
- [ ] Inspect current API module structure.
- [ ] Inspect current mobile navigation and component structure.
- [ ] Identify existing implemented features and avoid breaking them.
- [ ] Create a local implementation checklist before coding.

## 4. General coding rules

- Prefer clear, maintainable code over over-engineering.
- Keep business rules in backend services/use cases, not controllers.
- Controllers should validate request, call service, return DTO response.
- Mobile screens should not contain complex business logic.
- Shared UI patterns should be extracted into reusable components.
- Use strict DTO validation on backend.
- Enforce ownership/authorization at the service/repository level.
- Every list endpoint should support pagination or explicit limit.
- Every mutation should validate user ownership.
- Avoid raw SQL unless there is a strong reason.
- Prefer Prisma-compatible queries for readability and portability.

## 5. Database migration rules

- Use Prisma migrations as the source of truth.
- Do not manually apply Supabase SQL without storing migration files in repo.
- If the DB currently contains production data, use backward-compatible migrations.
- Add indexes for common filters and joins.
- Avoid global unique constraints for user-owned names unless intended.
- Use soft delete where user-generated content or audit history matters.

## 6. Backend quality rules

Every backend module should have:

```txt
module
controller
service/use-case
repository if needed
dto
entity/mapper if needed
policy/guard if needed
tests where practical
```

Important backend concerns:

- Authentication
- Authorization
- Ownership checks
- Input validation
- Pagination
- Rate limits or usage limits for AI/subscription features
- Error handling with meaningful errors
- Logging for important state transitions

## 7. Mobile quality rules

- For mobile UI tasks, use the project-local skills in `.codex/skills`:
  - `pet-mobile-ui-ux-design` before design or UX decisions.
  - `react-native-expo-ui-implementation` while coding React Native + Expo UI.
  - `mobile-ui-review-checklist` before marking the task complete.
- Keep navigation clear.
- Bottom sheets should be stable and reusable.
- Forms should use reusable field components and validation.
- API calls should use a consistent data fetching layer.
- Avoid duplicated state between screens.
- Empty/loading/error states are required.
- Destructive actions need confirmation.
- Premium feature gates should be clear and not frustrating.
- The mobile app should feel warm, friendly, trustworthy, clean, and practical; it should not look like an admin dashboard.

## 8. Done criteria

A task is done only when:

- Code compiles.
- Lint/typecheck passes or known failures are documented.
- Relevant tests pass or a test gap is documented.
- Feature can be manually tested from FE to BE.
- API and UI handle loading, empty, error, success cases.
- Docs/checklist are updated.
