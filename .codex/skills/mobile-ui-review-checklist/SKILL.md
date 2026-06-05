---
name: mobile-ui-review-checklist
description: Use before marking any YeuPet mobile UI task complete, and for reviewing React Native Expo screens, visual polish, UX quality, accessibility, dark mode, loading/empty/error states, pet-care copy, and implementation readiness.
---

# Mobile UI Review Checklist

Use this checklist before finalizing any YeuPet mobile UI/UX task. If an item fails, fix it or explicitly document why it is out of scope.

## Required Review Flow

1. Re-read the user request and affected feature docs.
2. Check the implemented UI against `pet-mobile-ui-ux-design`.
3. Check the code against `react-native-expo-ui-implementation`.
4. Run relevant local verification commands.
5. Manually inspect the changed screen states.
6. Report remaining risks or test gaps.

## Product Fit

- The screen feels warm, friendly, trustworthy, clean, and practical.
- The UI does not look like an admin dashboard.
- The main user job is obvious within the first viewport.
- The pet, owner, sitter, or care context is visible where relevant.
- Premium gates, medical warnings, and error messages are respectful.

## Layout And Hierarchy

- One primary purpose per screen.
- Clear hierarchy: screen title, section headings, primary action, supporting details.
- Spacing follows a 4/8-point rhythm and avoids cramped density.
- Cards, rows, and controls have stable dimensions.
- No card is nested inside another card.
- Content does not collide with safe areas, tab bars, keyboard, or sticky actions.
- Text does not clip, overlap, or overflow buttons/cards on small screens.

## Components

- Existing UI primitives are reused where appropriate.
- New primitives are generic and live in `components/ui`; feature components live outside primitives.
- Buttons have pressed, disabled, and loading states.
- Icon-only buttons have labels/tooltips/accessibility labels where applicable.
- Lists use virtualized components when they can grow.
- Bottom sheets and modals have clear titles, context, dismiss behavior, and fixed actions when needed.

## Forms

- Labels are clear and human.
- Required fields are obvious without shouting.
- Validation is inline, specific, and preserves user input.
- Pickers, toggles, chips, steppers, and date/time controls replace free text where appropriate.
- Submit loading and mutation error states are visible.
- Destructive actions require confirmation.

## Loading, Empty, Error, Success

- Loading state preserves layout shape or clearly indicates progress.
- Empty state explains what is missing and offers a next action.
- Error state is recoverable with retry or clear guidance.
- Offline/stale states show sync context when relevant.
- Success state confirms the result and leaves the user in a sensible place.

## Dark Mode

- All surfaces, text, icons, borders, inputs, chips, charts, and media treatments are readable.
- Semantic theme tokens are used instead of raw light/dark inversions.
- Contrast is sufficient for body text, secondary text, disabled controls, and status labels.
- Shadows do not create muddy dark surfaces.

## Accessibility

- Touch targets are at least 44x44 pt.
- Color is not the only status indicator.
- Text scaling does not break layout.
- Icon-only/custom controls have `accessibilityLabel` and appropriate roles.
- Forms have logical focus order and readable validation.
- Important actions are not gesture-only.

## Pet-Care Copy

- Tone is warm, practical, and reassuring.
- Medical, budget, booking, and account-risk copy is clear instead of cute.
- Pet names are used when available.
- Empty and error copy gives a concrete next step.
- AI and medical guidance includes uncertainty and vet escalation when appropriate.

## Feature-Specific Checks

- Home: today's priorities, active pet context, quick actions, and recent activity are easy to scan.
- Pet Management: pet identity, photo fallback, key details, edit flow, and pet switching are clear.
- Reminder: overdue/today/upcoming/completed states and recurrence summaries are understandable.
- Medical Records: record type, date, source/vet, attachment, and timeline/history are trustworthy.
- Budget Statistics: charts are readable, summarized in text, and not dashboard-dense.
- Photos Social: media loads predictably, privacy/reporting states are considered, empty feed feels inviting.
- Sitter Booking: trust signals, availability, pricing, pet needs, review step, and cancellation/contact states are clear.
- Pet Care AI: prompt suggestions, pending state, answer readability, error recovery, and medical boundaries are clear.
- Settings: account, pets, notifications, privacy, subscription, support, appearance, and destructive actions are grouped logically.

## Implementation Checks

- TypeScript stays strict; avoid `any`.
- API calls use `APIs` helpers, route constants, and React Query where applicable.
- Query keys and interfaces are updated for new data.
- UI state is not duplicated unnecessarily between local state, React Query, and Zustand.
- NativeWind classes use theme tokens.
- Raw colors are avoided unless a native API requires them.
- Long lists are virtualized.
- Keyboard behavior is tested for forms and sheets.

## Verification Commands

Run the most relevant commands available in the repo, such as:

```sh
pnpm --filter @yeu-pet/mobile lint
pnpm --filter @yeu-pet/mobile typecheck
pnpm --filter @yeu-pet/mobile test
```

If a command does not exist or fails for unrelated known reasons, record that in the final response with the exact command and reason.

## Completion Rule

Do not mark a UI task complete until:

- Visual states are implemented or explicitly scoped out.
- Dark mode and accessibility have been checked.
- Relevant verification commands have run or their absence is documented.
- The final response names any remaining risks, test gaps, or follow-up work.
