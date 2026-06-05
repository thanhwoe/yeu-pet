# 02 — Target Folder Structure

## Recommended target structure

Prefer this target structure under `apps/mobile`.

If the project already has a `src/` alias, use `src/`. If not, either create it carefully with alias support or adapt the same structure at the current root level. Do not break existing TypeScript path aliases.

```txt
apps/mobile/
├── app/                              # Expo Router routes only
├── src/
│   ├── api/                          # Central API client and endpoint modules
│   ├── components/
│   │   ├── ui/                       # Low-level reusable primitives
│   │   ├── layout/                   # Screen/app layout components
│   │   ├── feedback/                 # Empty/Error/Loading/Toast/Modal patterns
│   │   ├── form/                     # Generic form controllers
│   │   ├── media/                    # Image/document/gallery components
│   │   ├── navigation/               # Headers/tabs/navigation helpers
│   │   └── common/                   # App-specific reusable components
│   ├── features/
│   │   ├── auth/
│   │   ├── me/
│   │   ├── settings/
│   │   ├── subscriptions/
│   │   ├── pets/
│   │   ├── reminders/
│   │   ├── medical-records/
│   │   ├── budget/
│   │   ├── photos/
│   │   ├── sitter/
│   │   ├── ai/
│   │   └── notifications/
│   ├── hooks/
│   ├── stores/
│   ├── theme/
│   ├── utils/
│   ├── constants/
│   └── types/
├── assets/
├── modules/
├── android/
├── ios/
└── docs/
```

## Feature module structure

Each Phase 1 feature should use a consistent shape:

```txt
src/features/<feature>/
├── api.ts                 # Feature API calls, if not fully centralized
├── hooks.ts               # React Query hooks and feature hooks
├── types.ts               # DTOs, API responses, UI models
├── schemas.ts             # Zod schemas for forms
├── constants.ts           # Feature constants/enums/options
├── utils.ts               # Feature-specific formatting/helpers
├── components/            # Feature-specific components only
├── screens/               # Feature screens
└── index.ts               # Optional controlled public exports
```

Avoid large `index.ts` barrel files that export everything and create circular dependencies.

## API folder

```txt
src/api/
├── client.ts
├── errors.ts
├── queryKeys.ts
├── auth.api.ts
├── me.api.ts
├── settings.api.ts
├── subscriptions.api.ts
├── pets.api.ts
├── reminders.api.ts
├── medical-records.api.ts
├── budgets.api.ts
├── photos.api.ts
├── reports.api.ts
├── sitters.api.ts
├── sitter-bookings.api.ts
├── ai.api.ts
├── devices.api.ts
└── notifications.api.ts
```

Rules:

- `client.ts` owns Axios instance, auth header, refresh handling, error normalization.
- API files only contain transport functions, not UI logic.
- React Query hooks can live in feature `hooks.ts` or `src/api/<feature>.hooks.ts`; choose one convention and document it.
- Do not make raw Axios calls from screen files.

## UI primitive folder

Keep true primitives in `src/components/ui`.

Examples:

```txt
src/components/ui/
├── AppText/
├── AppButton/
├── AppIconButton/
├── AppCard/
├── AppInput/
├── AppTextarea/
├── AppCheckbox/
├── AppSwitch/
├── AppSelect/
├── AppBottomSheet/
├── AppModal/
├── AppSpinner/
├── AppProgressBar/
├── AppAvatar/
├── AppImage/
├── StatusBadge/
└── FilterChip/
```

A UI primitive must not import feature code.

## Layout folder

```txt
src/components/layout/
├── AppScreen/
├── AppHeader/
├── SectionHeader/
├── BottomActionWrapper/
└── KeyboardAwareContainer/
```

## Feedback folder

```txt
src/components/feedback/
├── EmptyState/
├── ErrorState/
├── LoadingState/
├── ConfirmDialog/
├── Toast/
└── Skeleton/
```

## Form folder

Generic form controllers go here:

```txt
src/components/form/
├── InputController/
├── CheckboxController/
├── DateTimePickerController/
├── OptionInputController/
├── PetPickerController/
├── UnitInputController/
├── PhoneInputController/
├── AvatarInputController/
└── DocumentsInputController/
```

Important: if a controller is feature-specific, keep it in the feature module instead.

## Media folder

```txt
src/components/media/
├── ImageGallery/
├── FullscreenImageViewer/
├── DocumentUploader/
└── FileItem/
```

## Navigation folder

```txt
src/components/navigation/
├── BackHeader/
├── HomeHeader/
├── ReminderHeader/
├── HapticTab/
└── Tabs/
```

## Feature component placement examples

Move or map current components as follows.

### Pets

```txt
PetCardCarousel/       -> src/features/pets/components/PetCardCarousel/
PetInfoForm/           -> src/features/pets/components/PetInfoForm/
PetPickerController/   -> keep generic form if used globally, otherwise pets/components
```

### Reminders

```txt
ReminderCalendar/      -> src/features/reminders/components/ReminderCalendar/
ReminderForm/          -> src/features/reminders/components/ReminderForm/
ReminderIcons/         -> src/features/reminders/components/ReminderIcons/
```

### Medical Records

```txt
MedicalRecordForm/     -> src/features/medical-records/components/MedicalRecordForm/
PetTimeline/           -> src/features/medical-records/components/PetTimeline/
DocumentsInputController/ -> shared media/form only if used outside medical records
ImageGallery/          -> shared media if used by photos and medical records
```

### Budget

```txt
BudgetCategoryForm/          -> src/features/budget/components/BudgetCategoryForm/
BudgetCategoryStatistic/     -> src/features/budget/components/BudgetCategoryStatistic/
BudgetTransaction/           -> src/features/budget/components/BudgetTransaction/
BudgetTransactionForm/       -> src/features/budget/components/BudgetTransactionForm/
chart/                       -> src/features/budget/components/charts/ unless used globally
```

### Photos

```txt
LikeButton/            -> src/features/photos/components/LikeButton/
ImageGallery/          -> shared media if also used by medical records
```

### Sitter

```txt
Sitter-specific cards/forms/messages -> src/features/sitter/components/
ChatMessage -> shared chat component only if reused by AI and sitter messages; otherwise feature-specific
```

### AI

```txt
ChatMessage/           -> src/features/ai/components/ChatMessage/ or shared chat
Markdown/              -> shared common if reused
TypingMessage/         -> src/features/ai/components/TypingMessage/
LoadingMessage/        -> src/features/ai/components/LoadingMessage/
```

## Out-of-scope component handling

Do not move/refactor these unless needed for compile stability:

```txt
CartButton/
ClinicCard/
SpaCard/
PetClinicList/
QuantityInput/
Store/Product components
Training components
VNPAY/payment-related code
```

Mark them as frozen in the audit.

## Route file pattern

Route files in `app/` should be thin.

Example:

```tsx
import { ReminderScreen } from '@/features/reminders/screens/ReminderScreen';

export default ReminderScreen;
```

If a route needs providers or auth guards, compose them minimally.

## Import rules

Use stable aliases. Avoid long relative import chains.

Recommended:

```tsx
import { AppButton } from '@/components/ui/AppButton';
import { usePets } from '@/features/pets/hooks';
```

Avoid:

```tsx
import { AppButton } from '../../../../components/ui/Button';
```

## Migration safety

When moving files:

1. Move one feature group at a time.
2. Update imports.
3. Run lint/typecheck.
4. Fix path aliases.
5. Commit/report the group before moving another major group.
