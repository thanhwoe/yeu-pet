# 03 — Component Refactor Spec

## Component classification

Every component must be classified before refactor.

### 1. UI primitive

A low-level building block with no business knowledge.

Examples:

- Button
- Text
- Input
- Checkbox
- Avatar
- Card
- Spinner
- ProgressBar
- BottomSheet

Rules:

- Must not import feature modules.
- Must support theme/light/dark mode.
- Must have consistent props.
- Must support disabled/loading/error states where applicable.

### 2. Shared app component

A reusable component that has app-specific behavior but is used across multiple features.

Examples:

- AppHeader
- SectionHeader
- EmptyState
- ConfirmDialog
- Toast
- ImageGallery
- FullscreenImageViewer
- DocumentUploader
- SearchInput

Rules:

- May know app-level design patterns.
- Must not know a single feature's API details.
- Should accept data/handlers through props.

### 3. Feature component

A component specific to one feature.

Examples:

- PetCardCarousel
- ReminderCalendar
- MedicalRecordForm
- BudgetTransactionForm
- SitterProfileCard
- AIConversationItem

Rules:

- Keep inside `features/<feature>/components`.
- May import feature types/hooks/utils.
- Must not be imported by unrelated features unless intentionally promoted to shared.

### 4. Screen component

Top-level feature UI that composes hooks and components.

Rules:

- Keep inside `features/<feature>/screens`.
- May call feature hooks.
- Must not contain large low-level UI primitives inline.
- Must not make raw Axios calls.

## Current component mapping guidance

### Keep/refactor as UI primitives

Current path examples:

```txt
components/ui/Avatar
components/ui/BottomSheet
components/ui/Button
components/ui/Checkbox
components/ui/Image
components/ui/InputField
components/ui/Options
components/ui/ProgressBar
components/ui/RadioCheckbox
components/ui/ScreenContainer
components/ui/Spinner
components/ui/StateView
components/ui/Text
components/ui/Typography
```

Refactor goals:

- Normalize naming to App-prefixed or consistent component names.
- Ensure all primitives use theme tokens.
- Ensure props are typed.
- Ensure no feature imports.
- Ensure disabled/loading/error states.
- Ensure touch targets are at least 44x44 where applicable.

### Move to shared layout/navigation/feedback

```txt
AppLoader              -> feedback/LoadingState or feedback/AppLoader
ListLoader             -> feedback/ListLoader or Skeleton
Skeleton               -> feedback/Skeleton
Modal                  -> feedback/AppModal or ConfirmDialog
Popup                  -> feedback/Popup or ConfirmDialog
Toast                  -> feedback/Toast
RefreshControl         -> common/RefreshControl
BottomActionWrapper    -> layout/BottomActionWrapper
Headers/*              -> navigation/* or layout/*
Tabs                   -> navigation/Tabs
HapticTab.tsx          -> navigation/HapticTab
SearchInput            -> common/SearchInput
```

### Move to shared form/media when generic

```txt
AvatarInputController
CheckboxController
DatetimePickerController
DocumentsInputController
InputController
OptionInputController
PhoneInputController
UnitInputController
PetPickerController
```

Before moving, inspect usage.

If a controller is only used by one feature, keep it feature-specific. If used across multiple features, move to `components/form`.

### Move to pets feature

```txt
PetCardCarousel
PetInfoForm
```

Refactor requirements:

- Accept API pet model with `weightValue` and `weightUnit`.
- Do not assume fake/static data.
- Support loading and empty state from parent screen.
- Delete action must be protected by confirmation.
- Edit action should open bottom sheet or navigate according to current UX.

### Move to reminders feature

```txt
ReminderCalendar
ReminderForm
ReminderIcons
```

Refactor requirements:

- Use ISO dates safely.
- No `Invalid Date` display.
- Support reminder statuses.
- Support date range filters.
- Reminder form must validate scheduled date/time.
- Recurrence UI should be hidden or limited if backend contract is not fully supported in mobile UI.

### Move to medical records feature

```txt
MedicalRecordForm
PetTimeline
```

Refactor requirements:

- Support record types: vaccination, checkup, surgery, medication.
- Support up to backend entitlement image limit.
- Use shared document/image uploader if generic.
- Show attachment processing/ready/failed states.
- Support fullscreen image viewing.

### Move to budget feature

```txt
BudgetCategoryForm
BudgetCategoryStatistic
BudgetTransaction
BudgetTransactionForm
chart/*
```

Refactor requirements:

- Keep charts feature-local unless reused elsewhere.
- Handle zero budget.
- Cap progress bar at 100%.
- Show over-budget copy clearly.
- Format VND consistently.
- Support month/year and optional pet filter.

### Move to photos feature

```txt
LikeButton
```

Potential shared/media:

```txt
ImageGallery
```

Refactor requirements:

- Like/unlike must be idempotent.
- Do not use legacy toggle-like unless explicitly required.
- Comment/reply/delete logic belongs in photos feature.
- Fullscreen photo modal should be feature-specific if it includes like/comment actions.

### Move to AI or shared chat

```txt
ChatMessage
Markdown
TypingMessage
LoadingMessage
```

Decision rule:

- If used only by Pet Care AI, move to `features/ai/components`.
- If also used by Sitter Booking Messages, create `components/common/chat` with generic `ChatBubble`, then wrap in feature components.

### Leave out of scope/frozen

Do not refactor unless required for compile stability:

```txt
CartButton
ClinicCard
SpaCard
PetClinicList
QuantityInput
ProductDetailHeader
Product/store components
Training components
VNPAY/payment modules
```

## Component quality checklist

Every refactored component must satisfy:

- Typed props.
- No unused props.
- No raw API calls.
- No unnecessary global state.
- No hardcoded feature-specific copy in primitives.
- Light/dark mode support.
- Loading/disabled/error state if relevant.
- Consistent spacing/radius.
- Safe touch target.
- Reasonable memoization only when needed.

## Component anti-patterns to remove

Avoid:

```tsx
// Feature API call inside visual component.
await axios.post('/pets', data);
```

Avoid:

```tsx
// Hardcoded colors in feature screen.
<View style={{ backgroundColor: '#FFFFFF' }} />
```

Avoid:

```tsx
// Server state in Zustand.
const pets = usePetsStore((s) => s.pets);
```

Prefer:

```tsx
const { data, isLoading, error } = usePetsQuery();
```

Avoid:

```tsx
// Deep feature dependency from primitive.
import { Pet } from '@/features/pets/types';
```

## Migration process per component group

For each group:

1. Inspect current usage.
2. Classify component.
3. Move to target folder.
4. Update imports.
5. Remove duplicate wrappers if safe.
6. Add missing states/props.
7. Run lint/typecheck.
8. Update `mobile-refactor-plan.md` status.
