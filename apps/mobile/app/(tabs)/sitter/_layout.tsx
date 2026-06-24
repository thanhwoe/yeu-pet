import { SitterFilterDrawer } from "@/features/sitter/components/SitterFilterDrawer";
import {
  SitterFiltersProvider,
  useSitterFilters,
} from "@/features/sitter/SitterFiltersContext";
import { Drawer } from "expo-router/drawer";

const SitterDrawerNavigator = () => {
  const { beginEditing, discardDraft } = useSitterFilters();

  return (
    <Drawer
      drawerContent={(props) => <SitterFilterDrawer {...props} />}
      screenListeners={{
        transitionStart: ({ data }) => {
          if (!data.closing) beginEditing();
        },
        transitionEnd: ({ data }) => {
          if (data.closing) discardDraft();
        },
      }}
      screenOptions={{
        drawerPosition: "right",
        drawerType: "front",
        drawerStyle: { width: "88%" },
        headerShown: false,
        keyboardDismissMode: "on-drag",
        overlayAccessibilityLabel: "Close sitter filters",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Sitter" }} />
    </Drawer>
  );
};

export default function SitterLayout() {
  return (
    <SitterFiltersProvider>
      <SitterDrawerNavigator />
    </SitterFiltersProvider>
  );
}
