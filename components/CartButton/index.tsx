import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ShoppingCartIcon } from "phosphor-react-native";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";

const CartIcon = withIconClassName(ShoppingCartIcon);

const styles = cva("self-start bg-white items-center justify-center", {
  variants: {
    variant: {
      square: "rounded-xl p-3",
      circle: "rounded-full p-2",
    },
  },
  defaultVariants: {
    variant: "square",
  },
});

const badgeStyles = cva(
  "absolute bg-background-negative right-1 rounded-full flex-1 ",
  {
    variants: {
      variant: {
        square: "px-1 top-2",
        circle: "px-[2px] top-1",
      },
    },
    defaultVariants: {
      variant: "square",
    },
  }
);

interface ICartButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof styles> {
  badge?: number;
  size?: number;
}

export const CartButton = ({
  badge,
  variant,
  size,
  className,
  ...props
}: ICartButtonProps) => {
  return (
    <TouchableOpacity className={cn(styles({ variant, className }))} {...props}>
      <CartIcon size={size} className="text-icon-primary-foreground" />
      {badge && (
        <View className={cn(badgeStyles({ variant }))}>
          <Text
            variant="caption2"
            className="text-text-primary-inverse font-semibold"
          >
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
