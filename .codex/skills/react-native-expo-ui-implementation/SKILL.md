---
name: react-native-expo-ui-implementation
description: Use for implementing YeuPet mobile UI in React Native and Expo, including Expo Router screens, NativeWind styling, reusable UI primitives, forms, bottom sheets, modals, dark mode, accessibility, loading states, and feature screen polish.
---

# React Native + Expo UI Implementation

Use this skill when coding YeuPet mobile UI. Pair it with `pet-mobile-ui-ux-design` for screen or flow design decisions and `mobile-ui-review-checklist` before completion.

## Repo Fit

- Work in `apps/mobile` for the mobile app.
- Use Expo Router route files in `app/`; prefer route shims that compose screen modules when the repo already follows that pattern.
- Use existing `components/ui` primitives before creating new UI.
- Keep feature orchestration in `features/<domain>` hooks when screens need queries, mutations, cache updates, or form mapping.
- Keep API calls in `services` using the initialized `APIs` helper and route constants.
- Use React Query for server state and Zustand for durable app/session state.

## Styling Rules

- Prefer NativeWind `className` with project theme tokens.
- Use semantic colors from the theme instead of raw hex values.
- Use spacing from the existing scale and favor 4/8-point increments.
- Use existing font, radius, shadow, and color tokens.
- Avoid dashboard-like density, table layouts, and generic gray SaaS visuals.
- Do not introduce a new design system for one screen.
- If a component needs variants, follow existing `class-variance-authority` patterns in `components/ui`.
- Use native style objects only when required by React Native APIs, animation, charts, or shadows.

## Screen Structure

- Respect `SafeAreaView`/safe-area boundaries and keyboard behavior.
- Keep route screens focused on composition, navigation options, and local layout.
- Extract repeated product UI into `components` or feature components.
- Extract generic primitives into `components/ui`; primitives must not know domain concepts such as pet, sitter, budget, or reminder.
- Prefer `FlatList`, `SectionList`, or virtualized components for long lists.
- Use stable dimensions for avatars, image tiles, bottom tabs, icon buttons, charts, and skeletons to prevent layout shift.

## Component Patterns

### Cards And Rows

- Build cards from existing primitives where possible.
- Keep card tap behavior clear: whole-card tap for detail, separate controls for secondary actions.
- Provide pressed, disabled, loading, and dark-mode states.

### Forms

- Use React Hook Form and Zod where form validation exists or is being added.
- Use reusable input, picker, date/time, toggle, segmented, and chip controls where available.
- Keep error messages inline and accessible.
- Preserve user input across validation and mutation failures.
- Disable submit only when necessary; show loading state during mutation.

### Bottom Sheets And Modals

- Reuse existing BottomSheet/Modal primitives.
- Give sheets stable snap behavior, keyboard handling, title/context, and a fixed action area for important submits.
- Use modals for confirmation, permission rationale, and destructive actions.
- Avoid long multi-step forms in a modal or bottom sheet.

### Loading, Empty, Error

- Use the repo's standard state components when available.
- Loading: skeleton or shape-preserving placeholder for content areas.
- Empty: short explanation plus primary action.
- Error: calm message, retry action, and no data loss.
- For mutation success, confirm with toast/snackbar or navigation to the updated state.

## Dark Mode

- Implement dark mode with semantic theme tokens, not hardcoded inversions.
- Audit every text, icon, border, surface, input, chart, and status chip in both modes.
- Use dark-mode appropriate depth: border/surface contrast instead of heavy shadows.
- Media should stay legible; do not place essential text over uncontrolled photos without a tested overlay.

## Accessibility

- Minimum touch target is 44x44 pt for direct interactions.
- Add `accessibilityLabel`, `accessibilityRole`, and state hints for icon-only and custom controls.
- Ensure text can scale without clipping.
- Pair status colors with labels/icons.
- Keep focus order logical for forms and modals.
- Do not hide important actions behind gestures only.

## Images, Media, And Icons

- Use optimized images and Expo-compatible image handling already present in the repo.
- Keep pet photos cropped predictably with fallback avatars.
- Use the app's established icon family. Do not mix icon styles casually.
- Icons must reinforce labels; avoid decorative icon clutter.

## Feature Implementation Notes

- Home: prioritize today, active pet, recent activity, and quick care actions.
- Pet Management: reusable pet avatar/card/header components; support missing photo and multiple pets.
- Reminder: SectionList by overdue/today/upcoming/done; recurrence controls need readable summaries.
- Medical Records: timeline/list patterns; attachment states; clear dates, vet/source, record type.
- Budget Statistics: readable Victory Native charts with text summaries and accessible labels.
- Photos Social: optimized media grid/feed; loading placeholders sized to final media.
- Sitter Booking: step-based booking UI, sitter trust details, review state before request/payment.
- Pet Care AI: chat or prompt UI with clear pending/error states and medical uncertainty copy.
- Settings: grouped list rows, toggles, subscription status, support, privacy, and confirmations.

## Verification

Before marking work complete:

- Run the most relevant lint/typecheck/test command available for `apps/mobile`.
- Manually inspect affected screens on at least one narrow mobile viewport and one typical phone viewport when feasible.
- Check light and dark mode.
- Exercise loading, empty, error, and success states where reachable.
- Run `mobile-ui-review-checklist` and fix any blocking issues.
