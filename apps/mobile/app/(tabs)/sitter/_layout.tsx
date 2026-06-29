import { SitterFilterDrawer } from "@/features/sitter/components/SitterFilterDrawer";
import {
  SitterFiltersProvider,
  useSitterFilters,
} from "@/features/sitter/SitterFiltersContext";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";

const SitterDrawerNavigator = () => {
  const { beginEditing, discardDraft } = useSitterFilters();
  const { t } = useTranslation();

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
        overlayAccessibilityLabel: t("sitter.accessibility.closeFilters"),
      }}
    >
      <Drawer.Screen
        name="index"
        options={{ title: t("sitter.screen.title") }}
      />
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
