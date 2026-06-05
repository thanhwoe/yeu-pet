---
name: pet-mobile-ui-ux-design
description: Use for YeuPet mobile app UI/UX design work, screen redesigns, feature UX flows, visual polish, interaction patterns, empty/loading/error states, dark mode, pet-care copy, and preventing the React Native app from feeling like an admin dashboard.
---

# YeuPet Mobile UI/UX Design

Use this skill whenever designing or revising YeuPet mobile screens, flows, components, copy, or visual hierarchy.

## Product Personality

YeuPet should feel warm, friendly, trustworthy, clean, and practical. It is for pet owners, caretakers, and pet lovers who want confidence and calm in daily pet care.

Avoid admin-dashboard patterns: dense tables, tiny controls, gray-on-gray cards, KPI walls, overloaded filters, and generic business SaaS layouts. The app can show structured data, but it must still feel personal, humane, and mobile-native.

## Design Principles

- Lead with the pet and the next useful action.
- Make care feel manageable: surface what matters today, not every available metric.
- Use soft, warm visual cues with restrained decoration.
- Prefer rounded, touchable, mobile-native components over table-like layouts.
- Keep screens scannable: one primary purpose per screen, then supporting details.
- Make trust visible through clear status, timestamps, source labels, and confirmation for sensitive actions.
- Use pet photos, avatars, species icons, and care-context visuals where they add meaning.
- Keep premium gates respectful: explain value, keep current task recoverable, and avoid blocking urgent care information.

## Layout Rules

- Use safe areas and respect the bottom tab bar, keyboard, and device notches.
- Prefer vertical mobile flows: header, contextual summary, primary action, content sections.
- Use cards for pet profiles, reminders, records, bookings, posts, and summaries. Do not nest cards inside cards.
- Keep content width naturally mobile; avoid desktop dashboard grids.
- Use horizontal carousels only when comparing pets or quick categories. Do not hide core actions exclusively in carousels.
- Use sticky or persistent actions only for high-frequency tasks such as add reminder, save form, book sitter, or ask AI.
- Use bottom sheets for contextual create/edit/filter flows; use full screens for long forms or high-stakes medical/billing workflows.

## Spacing And Hierarchy

- Use a 4/8-point rhythm. Common screen padding: 16-20.
- Space related items tightly and sections generously.
- Use one dominant heading per screen. Inside cards, use compact titles.
- Put primary actions near the content they affect.
- Use typography hierarchy before adding borders or background blocks.
- Keep labels short and values readable; avoid cramped two-column data unless the values are very small.
- Avoid all-caps labels except tiny metadata chips.

## Components And Patterns

### Cards

- Use cards for one meaningful object: pet, reminder, record, sitter, budget category, AI answer, or social post.
- Each card should have a clear title, supporting context, status, and at most one primary action.
- Prefer warm status chips over loud badges.
- Make the entire card tappable only when it opens detail; keep destructive or secondary actions separate.

### Lists

- Lists should have enough row height for touch, hierarchy, and pet context.
- Use avatars/icons, title, short metadata, status, and optional trailing action.
- Group lists by today/upcoming/history, pet, or category when it helps decision-making.
- Avoid table columns. Convert structured data into stacked rows, timelines, or grouped sections.

### Forms

- Use plain-language labels and helper text.
- Put required fields first. Defer optional details behind collapsible sections when forms are long.
- Use pickers, chips, steppers, date/time controls, toggles, and segmented controls instead of free text where possible.
- Show validation inline and preserve entered values.
- For medical and sitter flows, review important information before final submission.

### Bottom Sheets

- Use for quick actions, filters, small edits, pet selectors, reminder scheduling, and share/report menus.
- Include a title, concise context, visible drag handle, scroll behavior, and a fixed action area when needed.
- Avoid multi-step or dense medical forms in bottom sheets.

### Modals

- Use for confirmation, short alerts, destructive actions, permission rationale, or focused choices.
- Modal copy should explain consequence and recovery. Destructive buttons must be visually distinct.
- Do not use modals for routine navigation.

## States

- Loading states must preserve layout shape with skeletons or compact progress indicators.
- Empty states must explain what is missing and offer the next action.
- Error states must be calm, specific, and recoverable. Include retry when applicable.
- Success states should confirm the result briefly and return the user to the next useful place.
- Offline or sync-delayed states should show stale data carefully with last updated time when relevant.

## Dark Mode

- Every screen and component must be designed for dark mode.
- Do not invert light-mode colors mechanically. Use semantic tokens for background, card, text, line, status, and accent colors.
- Keep contrast strong enough for text, icons, inputs, chips, and disabled states.
- Shadows should become subtle depth, borders, or surface contrast in dark mode.
- Pet photos and colorful media must remain visible without dark overlays that hide important content.

## Accessibility

- Minimum touch target: 44x44 pt.
- Do not rely on color alone for status; pair color with text or icon.
- Text must support system font scaling without clipping or overlapping.
- Important controls need accessible labels and roles.
- Forms must support keyboard navigation, clear focus, and visible validation.
- Motion should be purposeful and not required to understand state.

## Pet-Care Copy Tone

- Warm, practical, and reassuring. Avoid cutesy language in medical, budget, booking, or error contexts.
- Speak to the owner as capable: "Add Bella's next vaccine" rather than "You forgot something."
- Use pet names when available.
- Prefer concrete next steps: "Try again", "Add first record", "Book a meet-and-greet".
- For AI and medical content, be careful: clarify uncertainty and recommend professional veterinary help for urgent or serious concerns.

## Feature Guidance

### Home

- Start with pet context and today's care priorities.
- Show urgent reminders, quick actions, and recent activity before broad summaries.
- Keep home calm: no KPI wall. Use friendly sections such as Today, Your Pets, Upcoming, and Quick Care.

### Pet Management

- Make pet identity central: photo/avatar, name, species/breed, age, weight, notes.
- Use profile cards and detail sections. Avoid form-heavy first impressions.
- Make switching pets obvious across related features.

### Reminder

- Optimize for schedule clarity: today, overdue, upcoming, completed.
- Use status chips and date/time hierarchy.
- Create/edit flows should support recurrence, pet selection, category, notes, and notification preferences.

### Medical Records

- Design for trust and retrieval. Use timelines, document cards, dates, vet/source, and attachments.
- Keep emergency and recent records easy to find.
- Avoid playful tone for diagnoses, medication, lab results, or vaccine records.

### Budget Statistics

- Use friendly insights, category summaries, trends, and recent expenses.
- Charts must be readable on small screens and have text summaries.
- Avoid finance-dashboard density. Help owners understand care spending, not perform accounting.

### Photos Social

- Media should lead. Use clean grids, post cards, reactions, comments, and sharing controls.
- Preserve pet identity and privacy controls.
- Empty states should invite a first memory, not feel like a failed feed.

### Sitter Booking

- Prioritize trust: sitter profile, availability, location/context, ratings, services, pricing, and safety notes.
- Booking flow should be step-by-step with clear dates, pet needs, and review before payment/request.
- Use reassuring copy for meet-and-greet, cancellation, and contact states.

### Pet Care AI

- Make AI feel supportive and bounded.
- Show prompt suggestions by pet and care context.
- Answers should include disclaimers for medical uncertainty, clear next steps, and when to contact a vet.
- Keep chat UI clean, readable, and accessible; do not overload with decorative assistant branding.

### Settings

- Keep settings simple, grouped, and predictable: account, pets, notifications, privacy, subscription, support, appearance.
- Destructive account actions require confirmation and clear consequence.
- Dark mode and notification controls must be easy to discover.

## Before Designing

- Check existing screens, tokens, and components before inventing new patterns.
- Identify the screen's main user job, emotional context, and highest-frequency action.
- Decide loading, empty, error, and dark-mode behavior up front.
- After implementation, use `mobile-ui-review-checklist` before marking the UI task complete.
