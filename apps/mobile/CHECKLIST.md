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

## Phase 2: Core Architecture Refactor

- [ ] Clean folder structure incrementally
- [ ] Extract shared UI components only where duplication is proven
- [ ] Standardize feature hooks for large screens
- [ ] Standardize API client usage and response types
- [ ] Standardize loading/error/empty states
- [ ] Standardize theme/design token usage
- [ ] Improve type safety in API errors and pagination responses
- [ ] Keep deferred domains isolated from active app navigation

## Phase 3: Bottom Sheet Fix

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

## Phase 4: Performance Optimization

- [ ] Optimize heavy screens
- [ ] Optimize FlatList/FlashList usage
- [ ] Memoize expensive renders where needed
- [ ] Remove unnecessary state
- [ ] Avoid inline heavy callbacks where needed
- [ ] Optimize images
- [ ] Check app startup performance
- [ ] Check bottom sheet and modal render cost

## Phase 5: UI Implementation for Existing APIs

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

## Phase 6: Testing & Verification

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
