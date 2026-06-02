# Yeu Pet Mobile Frontend Refactor Checklist

> Project: `apps/mobile`
> Plan: `frontend-refactor-plan.md`
> Status: Planning gate created on 2026-06-02

## Phase 1: Audit & Planning

- [x] Read project documents
- [x] Review `mobile-app-ui-design`
- [x] Audit current frontend architecture
- [x] Audit API integration
- [x] Audit navigation
- [x] Audit bottom sheet implementation
- [x] Identify missing UI for existing backend APIs
- [x] Create frontend refactor plan
- [x] Create mobile implementation checklist

## Phase 2: Folder Structure & Code Conventions

- [x] Define active folder direction in `frontend-refactor-plan.md`
- [x] Keep Expo Router files as route/layout shims where possible
- [x] Add `features/` for domain hooks and orchestration
- [x] Add `features/**/*` to NativeWind content scanning
- [ ] Move feature orchestration from oversized screens into `features/*` incrementally
- [ ] Keep `components/ui` for primitives only
- [ ] Keep feature-specific components out of `components/ui`
- [ ] Document code conventions for hooks, screens, services, and UI primitives
- [ ] Audit imports for consistent `@/*` absolute paths

## Phase 3: Core Architecture Refactor

- [x] Clean folder structure incrementally
- [x] Extract shared UI components only where duplication is proven
- [x] Standardize feature hooks for large screens
- [x] Standardize API client usage and response types
- [x] Standardize loading/error/empty states
- [x] Standardize theme/design token usage
- [x] Improve type safety in API errors and pagination responses
- [x] Keep deferred domains isolated from active app navigation
- [x] Align bottom tabs to active product tabs: home, reminder, service, sitter, settings
- [x] Keep deferred store route hidden from the bottom tab

## Phase 4: Theme & Shadows

- [x] Add `features/` to Tailwind/NativeWind scanning
- [x] Re-check `theme/shadows.ts`
- [x] Replace generic black shadow scale with warmer app-tinted shadows
- [ ] Audit direct `shadowColor: "#000"` usage
- [ ] Standardize shadow/elevation pairings for cards, floating actions, sheets, and modals
- [ ] Confirm dark-mode shadow behavior on device/simulator
- [ ] Document design token usage for spacing, radius, color, shadow, and typography

## Phase 5: Bottom Sheet Fix

- [x] Verify package compatibility
- [x] Verify Babel/Reanimated config
- [x] Verify `GestureHandlerRootView` placement
- [x] Verify `BottomSheetModalProvider` placement
- [x] Refactor reusable bottom sheet component
- [x] Document reusable bottom sheet usage
- [ ] Test with simple bottom sheet example
- [ ] Test real feature usage
- [ ] Test keyboard behavior
- [ ] Test Android/iOS behavior if possible

## Phase 6: Performance Optimization

- [ ] Optimize heavy screens
- [ ] Optimize FlatList/FlashList usage
- [ ] Memoize expensive renders where needed
- [ ] Remove unnecessary state
- [ ] Avoid inline heavy callbacks where needed
- [ ] Optimize images
- [ ] Check app startup performance
- [ ] Check bottom sheet and modal render cost

## Phase 7: UI Implementation for Existing APIs

- [ ] Map existing backend APIs to missing frontend features
- [ ] Create feature implementation plan
- [ ] Implement notifications UI
- [ ] Implement photo comments UI
- [ ] Implement settings/preferences UI
- [ ] Implement sitter browsing/profile UI
- [ ] Implement sitter booking/review UI
- [ ] Implement forms
- [ ] Implement API mutations/queries
- [ ] Implement validation
- [ ] Implement loading/error/success states
- [ ] Implement empty states
- [ ] Implement navigation flows

## Phase 8: Testing & Verification

- [ ] Run TypeScript check
- [ ] Run lint
- [ ] Run tests if available
- [ ] Run Expo app
- [ ] Verify major user flows
- [ ] Verify bottom sheet
- [ ] Verify API integration
- [ ] Verify no regressions
- [ ] Verify no Reanimated/Gesture Handler warnings
- [ ] Verify mobile UI against `mobile-app-ui-design`
