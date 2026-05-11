import { cssInterop } from "nativewind";
import { IconProps } from "phosphor-react-native";
import { FunctionComponent } from "react";

export const withIconClassName = (icon: FunctionComponent<IconProps>) => {
  return cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: { color: true },
    },
  });
};
