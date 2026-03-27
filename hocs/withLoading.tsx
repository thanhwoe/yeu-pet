import { Skeleton } from "@/components/Skeleton";
import { ComponentType } from "react";

// Define the props that the HOC will inject
interface InjectedProps {}

// Define the props that the HOC accepts
interface HOCOptions {
  loading?: boolean;
  loadingSize: string;
}

// Generic type for the wrapped component props
type WrappedComponentProps<T> = T & InjectedProps;

type WithHOCProps<T> = T & HOCOptions;

export function withLoading<T extends object>(
  WrappedComponent: ComponentType<WrappedComponentProps<T>>,
) {
  // Create the enhanced component
  const EnhancedComponent = (props: WithHOCProps<T>) => {
    const { loading = false, loadingSize, ...componentProps } = props;

    if (loading) {
      return (
        <Skeleton
          className={loadingSize}
          backgroundClassName="bg-background-primary"
        />
      );
    }

    return <WrappedComponent {...(componentProps as T)} />;
  };

  EnhancedComponent.displayName = `withLoading(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
