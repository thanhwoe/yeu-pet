import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ComponentType } from "react";

// Define the props that the HOC will inject
interface InjectedProps {
  inputComponent?: typeof BottomSheetTextInput;
}

// Generic type for the wrapped component props
type WrappedComponentProps<T> = T & InjectedProps;

export function withBottomSheetKeyboardEvents(
  WrappedComponent: ComponentType<WrappedComponentProps<any>>,
) {
  return function EnhancedComponent(props: Record<string, unknown>) {
    return <WrappedComponent {...props} inputComponent={BottomSheetTextInput} />;
  };
}
