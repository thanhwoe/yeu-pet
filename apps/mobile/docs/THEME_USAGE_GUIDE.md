# YeuPet Theme v2 Usage Guide

## Purpose

This guide explains how to use the improved YeuPet theme tokens when building or refactoring the mobile app UI.

The goal is to make the app feel:

- warm, friendly, and pet-care focused
- clean and trustworthy
- readable in both light and dark mode
- consistent across screens
- not overly orange or visually noisy

The current problem in several screens is that orange/brand colors are used as normal body text. In v2, **orange is an accent/action color**, not the default text color.

---

## Core rule

Do not use raw colors directly in screens.

Avoid:

```tsx
<Text className="text-orange-500">Description text</Text>
<View style={{ backgroundColor: '#FFF8F3' }} />
```

Prefer semantic tokens through the existing theme/Tailwind color system:

```tsx
<Text className="text-text-primary">Title</Text>
<Text className="text-text-muted">Description</Text>
<View className="bg-background-surface border-line-subtle" />
```

If a semantic token does not exist, add one to the theme instead of hardcoding a color.

---

## Token groups

### Text tokens

Use these for text hierarchy.

| Token | Use for |
|---|---|
| `text-primary` | Main titles, important labels, primary content |
| `text-secondary` | Secondary body text, row descriptions |
| `text-muted` | Less important descriptions, helper text |
| `text-subtle` | Metadata, timestamps, hints |
| `text-placeholder` | Input placeholders |
| `text-disabled` | Disabled text |
| `text-accent` | Highlighted values or small brand emphasis only |
| `text-link` | Links |
| `text-negative` | Error/destructive text |
| `text-positive` | Success text |
| `text-warning` | Warning text |

### Good usage

```tsx
<Text className="text-text-primary text-xl font-semibold">Settings</Text>
<Text className="text-text-muted text-sm">Name, email, and avatar</Text>
<Text className="text-text-accent text-sm font-medium">Edit</Text>
```

### Bad usage

```tsx
<Text className="text-text-accent">Every description on the screen</Text>
```

`text-accent` should be rare.

---

## Background and surface tokens

| Token | Use for |
|---|---|
| `background` | Main screen background |
| `background-surface` | Cards, settings sections, form surfaces |
| `background-surface-muted` | Secondary cards or subtle grouped backgrounds |
| `background-card` | General cards |
| `background-card-highlight` | Highlighted cards |
| `background-primary` | Primary buttons / strong action surface |
| `background-secondary` | Secondary surfaces |
| `background-tertiary` | Neutral low-emphasis backgrounds |

Example:

```tsx
<ScreenContainer className="bg-background">
  <View className="rounded-3xl bg-background-surface border border-line-subtle">
    ...
  </View>
</ScreenContainer>
```

---

## Line and border tokens

| Token | Use for |
|---|---|
| `line-subtle` | Default card/input dividers |
| `line-strong` | Stronger borders, selected controls |
| `line-highlight` | Rare accent border |
| `line-negative` | Error borders |
| `line-positive` | Success borders |
| `line-warning` | Warning borders |

Avoid using orange borders for every row. Use `line-subtle` for most separators.

---

## Action tokens

Use these for buttons and touchable actions.

| Token | Use for |
|---|---|
| `action-primary` | Main CTA button |
| `action-primary-pressed` | Pressed primary CTA |
| `action-primary-foreground` | Text/icon on primary CTA |
| `action-secondary` | Secondary button background |
| `action-secondary-foreground` | Text/icon on secondary button |
| `action-ghost` | Ghost button background |
| `action-ghost-foreground` | Ghost button text/icon |
| `action-danger` | Destructive button |
| `action-danger-foreground` | Text/icon on destructive button |

Example:

```tsx
<Button className="bg-action-primary">
  <Text className="text-action-primary-foreground">Save</Text>
</Button>
```

---

## Status tokens

Use for badges, alerts, validation, and statuses.

| Token | Use for |
|---|---|
| `status-success-surface` / `status-success-text` | Completed, active, healthy |
| `status-warning-surface` / `status-warning-text` | Pending, attention |
| `status-danger-surface` / `status-danger-text` | Failed, overdue, dangerous |
| `status-info-surface` / `status-info-text` | Informational, AI/info states |

Example:

```tsx
<View className="rounded-full bg-status-warning-surface border border-status-warning-border">
  <Text className="text-status-warning-text">Pending</Text>
</View>
```

---

## Feature accent tokens

Use feature tokens for icon chips, service cards, and small visual accents.

| Feature | Surface token | Accent token |
|---|---|---|
| Pet profile | `feature-pet-surface` | `feature-pet-accent` |
| Reminder | `feature-reminder-surface` | `feature-reminder-accent` |
| Medical records | `feature-medical-surface` | `feature-medical-accent` |
| Budget | `feature-budget-surface` | `feature-budget-accent` |
| Photos | `feature-photos-surface` | `feature-photos-accent` |
| Sitter | `feature-sitter-surface` | `feature-sitter-accent` |
| AI | `feature-ai-surface` | `feature-ai-accent` |
| Settings | `feature-settings-surface` | `feature-settings-accent` |

Example:

```tsx
<View className="bg-feature-medical-surface rounded-2xl">
  <MedicalIcon className="text-feature-medical-accent" />
</View>
```

---

## Component guidance

### Settings screen

Settings should be compact and scannable.

Use:

- title: `text-primary`
- row title: `text-primary`
- row description: `text-muted`
- action text: `text-accent`
- card background: `background-surface`
- divider: `line-subtle`
- logout: `action-danger` / `danger-text`

Avoid:

- orange text for all descriptions
- orange dividers for every row
- long paragraph explanations
- large mock upgrade buttons in production UI

### Forms

Use:

- label: `text-primary`
- helper: `text-muted`
- placeholder: `text-placeholder`
- input background: `background-surface`
- input border: `line-subtle`
- focused border: `line-highlight`
- error border: `line-negative`
- error text: `text-negative`

### Cards

Use:

- background: `background-card` or `background-surface`
- border: `line-subtle`
- title: `text-primary`
- description: `text-muted`
- icon chip: feature token

### Bottom sheets

Use:

- background: `background-surface`
- handle: `line-strong`
- title: `text-primary`
- description: `text-muted`
- primary button: `action-primary`
- cancel/secondary: `action-secondary`

### Lists

Use:

- item title: `text-primary`
- item subtitle: `text-muted`
- metadata: `text-subtle`
- row separator: `line-subtle`

---

## Naming convention

### Palette tokens

Palette tokens are raw color scales:

```txt
orange-50
slate-60
blue-90
red-10
```

They are allowed only inside the theme file.

### Semantic tokens

Semantic tokens describe UI purpose:

```txt
text-primary
background-surface
line-subtle
action-primary
status-danger-text
```

Use semantic tokens in app components.

### Feature tokens

Feature tokens describe product domains:

```txt
feature-reminder-accent
feature-medical-surface
feature-ai-accent
```

Use feature tokens for service cards, icon chips, and feature-specific highlights.

---

## Migration rules for Agent

When refactoring screens:

1. Search for hardcoded color values.
2. Replace raw palette usage with semantic tokens.
3. Replace overused orange text with:
   - `text-primary` for titles
   - `text-muted` for descriptions
   - `text-accent` only for actions/highlights
4. Replace orange row dividers with `line-subtle`.
5. Use `action-primary` for primary buttons.
6. Use `action-danger` for destructive buttons.
7. Test light mode and dark mode.
8. Capture screenshots if Computer Use is available.
9. Do not rename existing tokens unless all usages are migrated safely.

---

## Recommended checklist before marking UI done

For each refactored screen:

- [ ] No raw hex color in screen code
- [ ] No orange overload in secondary text
- [ ] Primary action uses action tokens
- [ ] Danger action uses danger tokens
- [ ] Cards use surface/card tokens
- [ ] Dividers use subtle line tokens
- [ ] Empty/loading/error states are readable
- [ ] Light mode checked
- [ ] Dark mode checked
- [ ] Long text does not break layout
- [ ] Touch targets remain comfortable
- [ ] Lint passes

---

## Practical examples

### Settings row

```tsx
<View className="flex-row items-center justify-between border-b border-line-subtle px-5 py-4">
  <View className="flex-1 pr-4">
    <Text className="text-base font-semibold text-text-primary">Care reminders</Text>
    <Text className="mt-1 text-sm text-text-muted">Vaccines, medicine, grooming</Text>
  </View>
  <Switch value={value} onValueChange={onChange} />
</View>
```

### Danger row

```tsx
<View className="rounded-3xl bg-danger-surface p-5">
  <Text className="text-base font-semibold text-danger-text">Logout</Text>
  <Text className="mt-1 text-sm text-text-muted">Sign out of this device</Text>
  <Button className="mt-4 bg-action-danger">
    <Text className="text-action-danger-foreground">Logout</Text>
  </Button>
</View>
```

### Feature card

```tsx
<View className="rounded-3xl bg-background-card border border-line-subtle p-5">
  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-feature-ai-surface">
    <SparkleIcon className="text-feature-ai-accent" />
  </View>
  <Text className="mt-4 text-lg font-semibold text-text-primary">Pet Care AI</Text>
  <Text className="mt-1 text-sm text-text-muted">Ask care questions based on your pet profile.</Text>
</View>
```

---

## Final note

The theme should help the app feel warmer and more polished, but UI quality still depends on component discipline.

The most important rule:

> Use semantic tokens by UI purpose, not palette tokens by color preference.
