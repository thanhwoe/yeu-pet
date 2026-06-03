# Agent Task Prompt — Phase 1 Refactor & Implementation

You are working on a monorepo pet-care mobile app startup.

## Mission

Refactor and complete phase 1 of the project with this delivery order:

1. Redesign database and Prisma schema.
2. Implement and refactor backend APIs in `apps/api`.
3. Refactor and implement mobile app features in `apps/mobile`.
4. Keep the project ready for future admin portal, ecommerce, grooming/clinic appointments, events, training documents, and SOS.

## Context

- Monorepo uses pnpm.
- Backend is NestJS + Prisma + Supabase PostgreSQL.
- Mobile app is React Native + Expo.
- Current features include pet management, reminders, budget statistics, photos social, medical records, sitter booking partial/backend.
- Missing or incomplete phase 1 features include Doctor AI, subscriptions, settings, sitter booking FE, stronger entitlement checks, and better database design.

## Required workflow

Before coding:

1. Read `README.md`.
2. Read every file in `docs/`.
3. Inspect current codebase structure.
4. Inspect current Prisma schema and migrations.
5. Create or update an implementation checklist in the repo.
6. Only then start coding.

During coding:

- Make small, reviewable commits/steps.
- Do not remove existing working features without replacing them.
- Prefer backward-compatible migrations when possible.
- Update docs whenever implementation differs from the plan.
- Add validation, authorization, error handling, and tests where practical.

## Strict constraints

- Do not call AI provider directly from the mobile app; Doctor AI must go through backend.
- Do not store provider API keys in the mobile app.
- Do not implement sitter payment in phase 1.
- Do not claim AI gives official veterinary diagnosis.
- Do not implement ecommerce/admin portal in this phase unless explicitly requested.
- Do not leave subscription enforcement only on FE; BE must enforce limits.

## Expected result

After completion, the project should have:

- Clean Prisma schema and migrations.
- Stable API modules for all phase 1 features.
- Mobile screens connected to real APIs.
- Subscription entitlement system.
- Doctor AI streaming API from backend to mobile.
- Settings screen with profile, notifications, appearance, language, subscription, logout.
- Sitter booking MVP with sitter registration, discovery, booking request, status flow, chat-ready structure, review/rating.
- Clear tests and release checklist.
