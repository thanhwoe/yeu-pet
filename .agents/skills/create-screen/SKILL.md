---
name: create-screen
description: Standard workflow for creating a new screen using Expo Router file-based routing.
---

# Create Expo Router Screen Skill

Use this skill when you need to design and create a new screen (route). The project uses Expo Router v3 with file-based routing.

## 1. Determine Route Location
Check the `app/` directory structure:
- For auth flows, use `app/(auth)/`.
- For main tab screens, use `app/(tabs)/`.
- For large feature flows, create a new folder (e.g., `app/budget/`) containing your routes.

## 2. Create the Screen Component
Screen logic must be kept in the `screens/` directory and exported directly to the `app/` folder. This keeps the routing clean.

Example: `screens/BudgetCategories/index.tsx`
```tsx
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { FlatList } from "react-native";
// (imports omitted for brevity)

export const BudgetCategoriesScreen = () => {
  return (
    <ScreenContainer>
      <FlatList
        // Component logic ...
      />
    </ScreenContainer>
  );
};
```

Example: `app/budget/categories.tsx`
```tsx
import { BudgetCategoriesScreen } from "@/screens/BudgetCategories";

export default BudgetCategoriesScreen;
```

## 3. Configuring Navigation and Header
If the screen requires custom headers or navigation configuration, utilize `Stack.Screen` within the feature's layout file (e.g., `app/budget/_layout.tsx`).

```tsx
import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";

export default function BudgetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="categories"
        options={{ header: BackHeader, title: "My categories" }}
      />
    </Stack>
  );
}
```

## Important Notes:
- Never place CSS or image files in the `app/` directory. All styles follow the `className` NativeWind approach, and assets live in `assets/`.
- Always wrap the main screen content with `<ScreenContainer>` to respect safe areas.
