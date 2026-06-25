import { ReactNode } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils";
import { Button } from "../Button";
import { Spinner } from "../Spinner";
import { Body, Heading } from "../Typography";

type StateViewVariant = "loading" | "empty" | "error";

interface StateViewProps {
  variant: StateViewVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const DEFAULT_COPY: Record<
  StateViewVariant,
  { titleKey: string; descriptionKey: string }
> = {
  loading: {
    titleKey: "state.loading.title",
    descriptionKey: "state.loading.description",
  },
  empty: {
    titleKey: "state.empty.title",
    descriptionKey: "state.empty.description",
  },
  error: {
    titleKey: "state.error.title",
    descriptionKey: "state.error.description",
  },
};

export const StateView = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: StateViewProps) => {
  const { t } = useTranslation();
  const copy = DEFAULT_COPY[variant];
  const resolvedTitle = title ?? t(copy.titleKey);
  const resolvedDescription = description ?? t(copy.descriptionKey);

  return (
    <View
      className={cn(
        "min-h-180 items-center justify-center gap-12 px-24 py-32",
        className,
      )}
    >
      {variant === "loading" ? <Spinner /> : icon}
      <View className="items-center gap-8">
        <Heading variant="h6" weight="bold" className="text-center">
          {resolvedTitle}
        </Heading>
        <Body variant="body3" className="text-center text-text-muted">
          {resolvedDescription}
        </Body>
      </View>
      {actionLabel && onAction ? (
        <Button variant="outline" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};
