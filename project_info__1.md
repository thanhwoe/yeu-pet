# Yeu Pet Monorepo — Mobile-Focused Documentation Guide

## Summary

The repository currently contains two mobile implementations, but the user’s direction has changed: the Capacitor rebuild is no longer the target. The useful output from `apps/mobile-capacitor` is therefore not the app itself, but the migration discipline, scope control, API-client hardening, and feature-domain documentation that can improve `apps/mobile`.

`apps/mobile` is the active Expo app and should be treated as the source of truth for user-facing mobile behavior. The Capacitor docs are still valuable because they clearly identify product scope, route grouping, API boundaries, and state-management patterns that can be carried back into the Expo app and its documentation.

## What the Capacitor docs contribute to the Expo mobile app

### 1. Clear scope control

The strongest value in `apps/mobile-capacitor` is not code, but scope management:

- explicit in-scope features
- explicit deferred features
- feature ownership by domain
- route map grouped by business capability
- a checklist that tracks progress by area

This is useful for `apps/mobile` because the Expo app currently contains a broader set of routes and features, including store/commerce, clinics, spas, training, and doctor AI. The Capacitor docs show how to separate:

- what is core product
- what is optional
- what should remain deferred

### 2. Cleaner architecture language

The Capacitor docs describe a modern app structure that maps well to the Expo app:

- API client as a dedicated transport layer
- session state in a small persisted store
- server state in React Query
- route state in the router
- environment configuration separated from feature logic

That is a good documentation model for `apps/mobile`, even if the implementation remains Expo-based.

### 3. Better API route organization

The Capacitor route registry is more explicit about domain boundaries than the Expo route constants alone. It groups routes by:

- auth
- onboarding
- pets
- reminders
- budget
- photos
- medical records
- sitter booking
- subscription

This is a useful pattern for `apps/mobile/constants/api-routes.ts`, even if the current Expo app still contains broader commerce routes.

### 4. Product direction: sitter booking and subscription

The migration docs show the current product emphasis:

- sitter booking is a first-class business feature
- subscription is a first-class user account feature
- store/commerce is not the current priority

That product direction should influence the Expo app documentation so developers know which parts are active and which are legacy.

---

## Architecture notes that should be reflected in `apps/mobile`

### Current Expo app architecture

`apps/mobile` is built on:

- Expo SDK 53
- Expo Router
- NativeWind/Tailwind
- Zustand
- React Query
- Axios
- React Hook Form + Zod
- native Expo modules for storage, camera, haptics, notifications, etc.

This is already a strong production stack. The documentation gap is not the implementation style; it is the lack of a concise, authoritative architecture guide that tells developers:

- which domains are in scope
- which routes are core
- which features are legacy or deferred
- how auth/session state is supposed to work
- how API requests should be structured

### Useful design patterns from Capacitor docs

The following patterns are worth adopting in the mobile documentation:

#### A. Domain-first feature grouping

Document features by business domain rather than by screen list:

- auth
- onboarding
- home
- reminders
- services hub
- budget
- photos
- medical records
- settings
- sitter booking
- subscription

#### B. Explicit out-of-scope list

Keep a documented “deferred” section for:

- store
- clinics
- spas
- training
- doctor AI
- VNPay/payment flows

This helps prevent accidental expansion.

#### C. Route map in docs

A route table is very useful for Expo Router projects because file-based routing can become hard to reason about when the app grows. The Capacitor migration plan’s route map is a good template for documenting `apps/mobile/app/`.

#### D. API contract ownership

The mobile app should document:

- which endpoint families it owns
- how auth is handled
- what response-shape normalization is expected
- which routes are shared with other clients

#### E. Session and token handling

Both apps use a Zustand store for user/session data, but the Expo app documentation should explicitly state:

- where tokens live
- how token refresh works
- what triggers logout
- how onboarding and verification gate access

---

## Key discrepancies between the two mobile docs

### 1. The Capacitor docs are narrower than the Expo app

`apps/mobile-capacitor` intentionally excludes several areas that still exist in the Expo app:

- commerce/store
- clinics/spas
- training
- doctor AI
- payments

That means the Expo app docs should be updated to distinguish:

- current production feature set
- legacy/side features
- product roadmap features

### 2. The Capacitor docs describe sitter booking, while the Expo app does not

The backend already has sitter-booking APIs, and the Capacitor migration plan treats them as an in-scope feature. The Expo app documentation does not yet clearly present sitter booking as a business feature, even though that may now be more important than the old store flow.

### 3. The Capacitor docs have better task tracking

`CHECKLIST.md` and `MIGRATION_PLAN.md` are valuable because they:

- define scope
- list feature ownership
- separate infrastructure from screens
- make dependencies visible

The Expo app has `AGENTS.md`, but it lacks a similarly explicit product-scope tracker.

---

## What should be updated in `apps/mobile` documentation

### 1. `apps/mobile/AGENTS.md`

This is the best place to add a short “product scope” section. It should clarify:

- Expo app is the active mobile app
- sitter booking and subscription are priority business features
- store/clinic/spa/training/doctor AI are legacy or lower priority if that is still true
- use API routes and store patterns consistently
- preserve the current architecture conventions

Recommended additions:

- a domain scope table
- a “do not expand without product approval” section
- a note that the app is the canonical mobile client for current users
- a brief mention of the backend sitter-booking domain

### 2. `apps/mobile/README.md`

The current README is still a generic Expo starter. It should be replaced or expanded with:

- actual project purpose: pet-care mobile app
- top-level architecture
- important directories
- run commands used in this monorepo
- core product domains
- environment variables
- key navigation patterns

This is one of the most important documentation updates to make.

### 3. `apps/mobile/constants/api-routes.ts`

The route constants file is a useful but undocumented source of truth. It should get a short header comment or companion doc explaining:

- it mirrors backend route families
- some routes are currently legacy/deferred
- route groups should be kept in sync with API ownership
- new features should prefer grouped route sections rather than random additions

### 4. `apps/mobile/constants/query-keys.ts`

This file already reveals the app’s data model, but its scope is larger than the current product direction. A companion doc should explain:

- which query-key groups are actively used
- which ones belong to deferred features
- how query keys map to API routes and screens

### 5. `apps/mobile/app/_layout.tsx`

The root layout file implements important auth/onboarding guards. This deserves documentation because it encodes the actual entry-flow logic:

- unauthenticated users → auth stack
- verified but not onboarded → onboarding
- authenticated and ready → tabs
- special feature screens outside tabs

This is critical app behavior and should be documented in the mobile architecture guide.

---

## Best reusable ideas from `apps/mobile-capacitor` to apply in `apps/mobile`

### 1. A dedicated architecture guide

Create a concise architecture doc for the Expo app that explains:

- runtime stack
- navigation model
- state model
- API model
- product scope

### 2. A scope tracker

Adopt the Capacitor-style checklist mindset for the Expo app:

- in scope
- deferred
- legacy
- product roadmap

This makes it easier for future contributors to know what to build.

### 3. Domain-based feature documentation

Use one folder/section per domain:

- auth
- onboarding
- home
- reminders
- services
- budget
- photos
- medical records
- settings
- sitter booking
- subscription

### 4. API route ownership map

Document which endpoint groups are touched by which feature domains. This reduces accidental duplication and makes refactors safer.

### 5. A clearer mobile-state contract

The Capacitor docs show the value of naming the responsibilities of:

- user/session store
- API client
- query cache
- environment config

The Expo app should have this documented, because right now those patterns are spread across many files.

---

## Suggested refactor/documentation priorities for the Expo mobile app

### Highest priority

1. Replace the generic Expo README with a real project README.
2. Expand `AGENTS.md` with product scope and architecture guidance.
3. Document the auth/onboarding/tab flow in the root layout.
4. Document the API route families and data-fetching patterns.
5. Mark legacy or deferred features clearly.

### Medium priority

1. Add a domain map for major feature folders.
2. Add a short explanation of query-key conventions.
3. Add a note about session storage and logout behavior.
4. Add a feature priority section for sitter booking and subscription.

### Lower priority

1. Add per-feature docs for budget, photos, medical records, and reminders.
2. Add a “legacy feature inventory” for store/clinic/spa/training/doctor AI.
3. Add a small migration note if any shared constants are synced with the Capacitor app.

---

## Recommended documentation changes in plain language

If the goal is to make `apps/mobile` easier to maintain, the docs should answer these questions immediately:

- What is this app?
- Which features are core?
- Which features are legacy or deferred?
- How does auth/onboarding work?
- Where does session state live?
- How does the app talk to the API?
- Which route groups are important?
- What should new developers read first?

The Capacitor docs answer these questions well. The Expo app docs currently do not.

---

## Suggested reading order for developers working in `apps/mobile`

1. `apps/mobile/README.md` — once updated, this should explain the app clearly.
2. `apps/mobile/AGENTS.md` — coding conventions and architecture rules.
3. `apps/mobile/app/_layout.tsx` — actual navigation and auth flow.
4. `apps/mobile/services/api-helper.ts` — API request behavior and token refresh.
5. `apps/mobile/services/auth.ts` — auth endpoints and login/logout semantics.
6. `apps/mobile/constants/api-routes.ts` — endpoint map.
7. `apps/mobile/constants/query-keys.ts` — caching structure.

---

## Bottom line

The Capacitor effort is no longer the target implementation, but its documentation is still highly valuable. The best parts to carry into the Expo app are:

- explicit scope control
- domain-based documentation
- route maps
- API ownership maps
- session/auth behavior documentation
- clear feature priorities

If you want, I can next produce a **mobile-only documentation plan** that lists the exact files in `apps/mobile` that should be updated, with suggested wording for each one.
