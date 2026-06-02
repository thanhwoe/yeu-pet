import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ComponentType } from "react";
import { FieldValues } from "react-hook-form";

// Define the props that the HOC will inject
interface InjectedProps {
  inputComponent?: typeof BottomSheetTextInput;
}

// Generic type for the wrapped component props
type WrappedComponentProps<T> = T & InjectedProps;

export function withBottomSheetKeyboardEvents<T extends FieldValues>(
  WrappedComponent: ComponentType<WrappedComponentProps<T>>
) {
  return function EnhancedComponent<FV extends FieldValues = T>(
    props: WrappedComponentProps<any>
  ) {
    return (
      <WrappedComponent {...props} inputComponent={BottomSheetTextInput} />
    );
  };
}
