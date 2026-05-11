import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { ComponentType } from "react";
import { FieldValues } from "react-hook-form";

// Define the props that the HOC will inject
interface InjectedProps {
  onBlur: () => void;
  onFocus: () => void;
}

// Define the props that the HOC accepts
interface HOCOptions {}

// Generic type for the wrapped component props
type WrappedComponentProps<T> = T & InjectedProps;

type WithHOCProps<T> = T & HOCOptions;

export function withBottomSheetKeyboardEvents<T extends FieldValues>(
  WrappedComponent: ComponentType<WrappedComponentProps<T>>
) {
  return function EnhancedComponent<FV extends FieldValues = T>(
    props: WrappedComponentProps<any>
  ) {
    const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

    const handleFocus = () => {
      shouldHandleKeyboardEvents.value = true;
    };
    const handleBlur = () => {
      shouldHandleKeyboardEvents.value = false;
    };

    const mergedProps = {
      ...props,
      onFocus: () => {
        handleFocus();
        props.onFocus?.();
      },
      onBlur: () => {
        handleBlur();
        props.onBlur?.();
      },
    };

    return <WrappedComponent {...mergedProps} />;
  };
}
