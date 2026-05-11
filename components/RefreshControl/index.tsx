import { cssInterop } from "nativewind";
import {
  RefreshControlProps,
  RefreshControl as RNRefreshControl,
} from "react-native";

interface StyledRefreshControlProps extends RefreshControlProps {
  color?: string;
  backgroundColor?: string;
  colorClassName?: string;
  backgroundColorClassName?: string;
}

export const RefreshControl = ({
  color,
  backgroundColor,
  ...props
}: StyledRefreshControlProps) => {
  return (
    <RNRefreshControl
      tintColor={color}
      colors={[color as string]}
      progressBackgroundColor={backgroundColor}
      {...props}
    />
  );
};

cssInterop(RefreshControl, {
  colorClassName: {
    target: false,
    nativeStyleToProp: { color: "color" },
  },
  backgroundColorClassName: {
    target: false,
    nativeStyleToProp: { color: "backgroundColor" },
  },
});
