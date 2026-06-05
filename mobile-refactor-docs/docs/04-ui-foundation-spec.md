# 04 — UI Foundation Spec

## Purpose

Before refactoring feature screens, create a consistent UI foundation. This prevents each feature from inventing its own card, button, typography, modal, and form styles.

The app should feel:

- warm
- friendly
- trustworthy
- practical
- clean
- pet-care focused
- not childish
- not like an admin dashboard

## Theme requirements

The project already has a theme system. Review it before changing.

Requirements:

- Support `system`, `light`, and `dark`.
- Settings must sync selected theme with backend `PATCH /settings`.
- Avoid hardcoded colors in feature screens.
- Use semantic theme tokens such as background, card, text, border, primary, danger, success, warning.
- Charts should use theme-aware colors.
- Bottom sheets and modals must work in dark mode.

## Foundation components to create or normalize

### AppScreen

Purpose: standard screen container.

Props:

```ts
type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  padded?: boolean;
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};
```

Rules:

- Applies background color.
- Handles safe area.
- Handles keyboard avoiding when requested.
- Supports scroll and non-scroll screens.
- Avoids duplicate padding in nested screens.

### AppHeader

Purpose: reusable header.

Variants:

- default
- back
- large title
- home greeting
- action header

Rules:

- Keep route-level headers consistent.
- Support right action buttons.
- Support subtitle.
- Use safe area where needed.

### AppCard

Purpose: all card surfaces.

Variants:

- default
- elevated
- outlined
- accent
- interactive

Rules:

- Theme-aware background.
- Consistent radius and padding.
- Pressable state for interactive cards.
- Do not overuse heavy shadows.

### AppButton

Variants:

- primary
- secondary
- ghost
- danger
- link

States:

- default
- pressed
- disabled
- loading

Rules:

- Minimum touch target 44px height.
- Clear loading state.
- No text-only destructive action without confirmation.

### AppIconButton

Rules:

- Minimum 44x44 touch target.
- Accessibility label required when icon-only.
- Use for card actions, header actions, and modal actions.

### AppText / Typography

Create consistent text variants:

```txt
display
screenTitle
sectionTitle
cardTitle
body
bodySmall
caption
button
label
helper
error
```

Rules:

- No random font sizes inside screens.
- Support theme color variants.
- Keep line height readable.

### AppTextField / AppTextarea

Rules:

- Works with React Hook Form controllers.
- Shows label, placeholder, helper, error.
- Supports disabled state.
- Supports multiline.
- Keyboard type where needed.

### AppSelect / Option Field

Rules:

- Used for type/species/gender/language/theme/category selection.
- Works inside bottom sheets.
- Has clear selected state.
- Supports disabled/error states.

### AppDatePickerField

Rules:

- Used for birthdate, reminder scheduled time, medical record date, transaction date, booking time.
- Must output stable Date/ISO value.
- Must avoid invalid date UI.

### AppBottomSheet

Rules:

- Standard handle style.
- Theme-aware background.
- Safe area bottom padding.
- Keyboard behavior configured.
- Should not be nested unnecessarily.
- Used for create/edit forms and action menus.

### ConfirmDialog

Rules:

- Required for destructive actions.
- Copy must say what will be deleted/cancelled.
- Danger button must be clearly styled.

### EmptyState

Props:

```ts
type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};
```

Rules:

- Friendly and helpful.
- Always include next action when possible.
- Must not feel like an error.

### ErrorState

Rules:

- Explain what failed.
- Provide retry action.
- Do not expose raw server stack/errors.

### LoadingState / Skeleton

Rules:

- Use skeleton for content-heavy screens.
- Use spinner for short/simple loading.
- Avoid full-screen spinner when existing content can remain visible.

### StatusBadge

Use for:

- reminder status
- medical attachment status
- booking status
- subscription plan
- photo status

Rules:

- Consistent colors.
- Text must be human-readable.

### FilterChip

Use for:

- reminder filters
- budget category filters
- photo visibility
- sitter search filters

Rules:

- Clear selected/unselected state.
- Scroll horizontally when many filters.

### StatCard

Use for:

- budget summary
- pet health summary
- sitter stats
- subscription usage

Rules:

- Highlight one metric.
- Include label and optional trend/help text.

### PetAvatar

Rules:

- Use Expo Image.
- Show fallback icon/initial when no avatar.
- Support size variants.
- Use for pet cards, lists, forms.

## UX rules by interaction type

### Forms

- Use React Hook Form + Zod.
- Disable submit while pending.
- Show inline validation errors.
- Keep optional fields visually less heavy.
- For long forms, use sections.
- For bottom sheet forms, ensure keyboard does not cover submit button.

### Lists

- Use FlashList for long or feed-like lists.
- Support empty state.
- Support pull to refresh where useful.
- Paginate feeds and comments.

### Bottom sheets

- Use for create/edit when form is short or medium.
- Use full screen route for long/complex workflows.
- Avoid stacking multiple bottom sheets.

### Delete/cancel actions

- Always confirm.
- Use soft language but clear consequence.
- Do not place destructive action as main card button unless necessary.

### Dates

- Format consistently.
- Use local timezone for display.
- Send ISO strings to backend.
- Never display `Invalid Date`.

## Screen quality requirement

Every Phase 1 screen must have:

- loading state
- empty state
- error state
- refresh/retry action where useful
- mutation pending state
- theme support
- consistent primary action

## Visual hierarchy rules

- One main action per screen.
- Secondary actions go into menus or secondary buttons.
- Cards should not contain too many equally prominent buttons.
- Important care information appears before decorative content.
- Use whitespace to group content.

## Copywriting tone

Use short, friendly, practical copy.

Good:

```txt
No reminders yet
Add your first reminder to keep your pet’s care routine on track.
```

Bad:

```txt
Data not found.
```

Good:

```txt
This AI can help with general pet-care guidance, but it is not a veterinarian.
```

Bad:

```txt
AI Doctor diagnosis result.
```
