import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { XIcon } from "phosphor-react-native";
import { Pressable, PressableProps, View } from "react-native";

const CloseIcon = withIconClassName(XIcon);

export const Close = (props: PressableProps) => (
  <Pressable {...props}>
    {({ pressed }) => (
      <View
        className={cn("p-2 rounded-full", {
          "border border-line-primary-foreground opacity-5": pressed,
        })}
      >
        <CloseIcon size={16} weight="bold" className="text-icon-foreground" />
      </View>
    )}
  </Pressable>
);
