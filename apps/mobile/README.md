# Yeu Pet Mobile

Expo-based mobile app for the Yeu Pet product.

This is the active mobile client. It uses Expo Router, NativeWind, Zustand, React Query, Axios, React Hook Form, and Zod.

## Purpose

The app provides the current user-facing mobile experience for:

- authentication
- onboarding
- home dashboard
- reminders
- services hub
- budget
- photos
- medical records
- settings
- sitter booking
- subscription

## Tech stack

- Expo SDK 53
- Expo Router
- React Native
- React Native Firebase Messaging
- NativeWind
- Zustand
- React Query
- Axios
- React Hook Form
- Zod
- Phosphor icons
- Victory Native

## Project structure

- `app/` — Expo Router screens and layouts
- `features/` — domain screens, feature components, and orchestration hooks
- `components/` — shared app components used across domains
- `components/ui/` — feature-free UI primitives
- `constants/` — API routes, query keys, validation, shared values
- `services/` — Axios helper and API domain services
- `stores/` — Zustand state
- `hooks/` — shared hooks
- `interfaces/` — TypeScript types
- `theme/` — design tokens
- `utils/` — helpers and formatters

## Navigation flow

The root layout controls access based on auth and onboarding state:

- unauthenticated users go to the auth flow
- verified users who have not completed onboarding go to onboarding
- authenticated and onboarded users go to the main tabs
- selected feature screens are mounted outside the tabs

See `app/_layout.tsx` for the actual guard logic.

## API and state patterns

### API access

Use `services/api-helper.ts` and the exported `APIs` client for all network requests.

Important behaviors:

- attaches bearer access tokens automatically
- converts API responses to camelCase
- refreshes tokens on 401 responses
- throws network errors with a friendly message

### Session state

User/session data lives in Zustand and is persisted with secure storage-backed adapters.

Important fields include:

- user profile
- access token
- refresh token
- OTP expiry
- device info

### Server state

Use React Query for server data and cache management.

## Key feature domains

### Auth

- sign in
- sign up
- logout
- forgot/reset password
- OTP verification

### Onboarding

- onboarding carousel
- complete onboarding mutation

### Home

- pet cards
- reminder snapshot
- budget snapshot

### Services

- launch entry points to app features
- keep this screen limited to in-scope domains

### Budget

- categories
- transactions
- statistics

### Photos

- upload
- social feed
- likes and stats

### Medical records

- record lists
- record details
- records by pet

### Pet Care AI

- conversation list and chat UI when backend support is available
- streaming responses through the API
- quota/paywall states from subscription entitlements
- no direct AI provider calls from the mobile app

### Sitter booking

- sitter browsing
- sitter profile
- booking creation
- booking management
- sitter reviews

### Subscription

- current tier display
- expiry information
- upgrade CTA when backend support is available

## API route conventions

`constants/api-routes.ts` is the shared route registry.

Keep route groups aligned to the backend domains:

- auth
- users
- pets
- reminders
- budget
- photos
- medical records
- sitter booking
- subscription

Prefer grouped constants over ad-hoc inline paths.

## Query key conventions

`constants/query-keys.ts` contains query key factories.

Use query keys consistently by feature domain so cache invalidation stays predictable.

## Environment variables

The app reads these environment values:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_RC_APPLE_API_KEY`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY`
- `EXPO_PUBLIC_RC_PREMIUM_ENTITLEMENT_ID`
- `FIREBASE_ANDROID_GOOGLE_SERVICES_FILE`
- `FIREBASE_IOS_GOOGLE_SERVICES_FILE`

Firebase service-file variables must point to the `google-services.json` and
`GoogleService-Info.plist` registered for the active `APP_VARIANT` package and
bundle identifier. Configure them as secret file variables in EAS. Local
development requires a native development build; Firebase Messaging does not
run inside Expo Go.

Default API URL behavior:

- iOS: `http://localhost:3000/api/v1`
- Android: `http://10.0.2.2:3000/api/v1`
- fallback: `http://localhost:3000/api/v1`

## Useful commands

```bash
# Start the Expo app
pnpm --filter @yeu-pet/mobile dev

# Run lint
pnpm --filter @yeu-pet/mobile lint

# Run native builds
pnpm --filter @yeu-pet/mobile android
pnpm --filter @yeu-pet/mobile ios
```

After adding or changing Firebase native modules, rebuild the development
client before starting Metro so the Firebase Messaging native code is linked.

RevenueCat Purchases and Customer Center also require a native development
build. Configure the public SDK keys and matching entitlement identifier in the
environment, then rebuild the client; RevenueCat UI is not available in Expo Go.
The iOS build keeps `GoogleUtilities` on modular headers so Firebase and the
RevenueCat Swift pods can coexist with the app's static-framework setup.

## Documentation to read first

1. `AGENTS.md`
2. `app/_layout.tsx`
3. `services/api-helper.ts`
4. `services/auth.ts`
5. `constants/api-routes.ts`
6. `constants/query-keys.ts`
7. `docs/12-mobile-api-contract.md`
8. `docs/mobile-fe-implementation-checklist.md`
9. `apps/mobile/docs/mobile-refactor-plan.md`

## Maintenance rules

- Keep the README aligned with the active product scope.
- Keep AI provider keys and provider calls in the backend only.
- Do not reintroduce deferred features into the main docs without product approval.
- Put feature-owned components under `features/<domain>/components`, not shared `components/`.
- If new domains are added, document them here and in `AGENTS.md`.
