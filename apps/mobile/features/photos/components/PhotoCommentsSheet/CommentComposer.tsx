import { Toast } from "@/components/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IPhotoComment } from "@/interfaces";
import { darkColorTheme, lightColorTheme } from "@/theme/colors";
import { getColors } from "@/theme/utils";
import { cn } from "@/utils";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import {
  ElementRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  InteractionManager,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from "react-native";

const SendIcon = withIconClassName(PaperPlaneTiltIcon);

interface CommentComposerProps {
  isCreating: boolean;
  onSubmit: (content: string) => Promise<void>;
  replyingTo: IPhotoComment | null;
  focusKey: number;
  onCancelReply: () => void;
  bottomInset: number;
  onLayout: (event: LayoutChangeEvent) => void;
}

export const CommentComposer = memo(
  ({
    isCreating,
    onSubmit,
    replyingTo,
    focusKey,
    onCancelReply,
    bottomInset,
    onLayout,
  }: CommentComposerProps) => {
    const [content, setContent] = useState("");
    const inputRef = useRef<ElementRef<typeof BottomSheetTextInput>>(null);
    const { colorScheme } = useColorScheme();
    const themeColors = useMemo(
      () =>
        getColors(colorScheme === "dark" ? darkColorTheme : lightColorTheme),
      [colorScheme],
    );
    const isDisabled = !content.trim() || isCreating;

    useEffect(() => {
      if (!replyingTo) {
        return undefined;
      }

      const task = InteractionManager.runAfterInteractions(() => {
        inputRef.current?.focus();
      });

      return () => task.cancel();
    }, [focusKey, replyingTo]);

    const handleSubmit = useCallback(async () => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        Toast.warn({
          title: "Write a comment",
          text: "Add some text before posting your comment.",
        });
        return;
      }

      try {
        await onSubmit(trimmedContent);
        setContent("");
      } catch {
        // The mutation handler already restores optimistic state and shows a toast.
      }
    }, [content, onSubmit]);

    return (
      <View
        className="border-t-hairline border-line-subtle bg-background px-16 pt-6"
        onLayout={onLayout}
        style={{ paddingBottom: Math.max(bottomInset, 12) }}
      >
        <View className="min-h-46 flex-row items-end gap-8 rounded-24 border border-line-subtle bg-background-surface px-12">
          <BottomSheetTextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            onBlur={onCancelReply}
            placeholder={
              replyingTo
                ? `Replying to ${replyingTo.accounts.firstName || "comment"}`
                : "Write a comment"
            }
            placeholderTextColor={themeColors["--text-subtle"]}
            multiline
            maxLength={300}
            className="max-h-72 min-h-30 flex-1 text-body3 text-text-primary mb-6"
          />
          <TouchableOpacity
            accessibilityLabel="Send comment"
            accessibilityRole="button"
            activeOpacity={0.82}
            className={cn(
              "h-38 w-38 items-center justify-center rounded-full bg-action-primary self-center",
              isDisabled && "opacity-50",
            )}
            disabled={isDisabled}
            hitSlop={4}
            onPress={handleSubmit}
          >
            {isCreating ? (
              <Spinner size={17} className="text-icon-primary-inverse" />
            ) : (
              <SendIcon
                size={18}
                weight="bold"
                className="text-icon-primary-inverse"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

CommentComposer.displayName = "CommentComposer";
