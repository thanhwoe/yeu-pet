---
description: How to create a new reusable UI component using CVA and NativeWind
---

# Create UI Component Workflow

Use this workflow when creating a new UI primitive component (e.g., Button, TextField, Skeleton) in the `components/ui` directory.

## 1. Ensure Directory Structure
Navigate to `components/ui`. Create a new folder named after your component (PascalCase), e.g., `components/ui/MyComponent/`.

## 2. Create styles.ts
Create a `styles.ts` file to hold styling logic utilizing `class-variance-authority` (`cva`). Avoid using inline styles; strictly use tailwind utility classes.
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const myComponentStyles = cva("base-classes-here rounded-16", {
  variants: {
    variant: {
      primary: "bg-background-primary",
      secondary: "bg-background-secondary",
    },
    size: {
      sm: "h-32",
      md: "h-42",
      lg: "h-50",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type MyComponentVariants = VariantProps<typeof myComponentStyles>;
```

## 3. Create index.tsx
Create the component logic file. Consume the variants utilizing `cn` (if available) or template literals, passing the `className` through. Provide full TypeScript typings.
```typescript
import { View, ViewProps } from "react-native";
import { myComponentStyles, MyComponentVariants } from "./styles";

interface MyComponentProps extends ViewProps, MyComponentVariants {
  className?: string;
}

export const MyComponent = ({ variant, size, className, ...props }: MyComponentProps) => {
  return (
    <View 
      className={myComponentStyles({ variant, size, class: className })}
      {...props} 
    />
  );
};
```
