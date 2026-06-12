import { ReactNode } from "react";
import { View } from "react-native";

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
  { title: string; description: string }
> = {
  loading: {
    title: "Loading",
    description: "Please wait a moment.",
  },
  empty: {
    title: "Nothing here yet",
    description: "Add the first item to get started.",
  },
  error: {
    title: "Something went wrong",
    description: "Please try again.",
  },
};

export const StateView = ({
  variant,
  title = DEFAULT_COPY[variant].title,
  description = DEFAULT_COPY[variant].description,
  actionLabel,
  onAction,
  icon,
  className,
}: StateViewProps) => {
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
          {title}
        </Heading>
        <Body variant="body3" className="text-center text-text-muted">
          {description}
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
