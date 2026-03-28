---
name: create-ui-component
description: Workflow for designing a new UI component using cva and NativeWind.
---

# Create NativeWind UI Component Skill

This skill standardizes the creation of Custom UI Components (reusable building blocks) for the Pet Land Design System.

## Architectural Rules:
- All reusable primitive components must reside in `components/ui/`.
- Each component belongs in a PascalCase directory (e.g., `Button`, `TextField`).
- You MUST separate layout logic (`index.tsx`) and CSS variant configurations (`styles.ts`).

## 1. Create Styles (`components/ui/[ComponentName]/styles.ts`)
Always utilize `class-variance-authority` (`cva`) to define variant-based styling. Strictly adhere to tailwind classes mapped to the custom `theme/` definitions (e.g., `text-body1`, `bg-background-primary`).

Example pulled directly from `components/ui/Button/styles.ts`:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonStyles = cva(
  "flex-row gap-8 justify-center rounded-16 items-center",
  {
    variants: {
      variant: {
        primary: "bg-background-primary",
        secondary: "bg-background-secondary",
        outline: "border border-line-secondary",
      },
      size: {
        sm: "h-42 px-16",
        md: "h-46 px-24",
        lg: "h-50 px-24",
      },
      disabled: {
        true: "opacity-50",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonStyles>;
```

## 2. Create Layout Logic (`components/ui/[ComponentName]/index.tsx`)
Build the main component file to consume the style variants and forward standard React Native properties.

Example based on `components/ui/Button/index.tsx`:
```tsx
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { buttonStyles, ButtonVariants } from "./styles";

interface ButtonProps extends TouchableOpacityProps, ButtonVariants {
  className?: string;
}

export const Button = ({ variant, size, className, disabled, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      className={buttonStyles({ variant, size, disabled, class: className })}
      disabled={disabled}
      {...props} 
    />
  );
};
```
