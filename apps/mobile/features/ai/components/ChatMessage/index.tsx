import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { TypingMessage } from "@/features/ai/components/TypingMessage";
import { ChatRole, IChatMessage } from "@/interfaces";
import { cn, date } from "@/utils";
import { View } from "react-native";

interface IProps {
  message: IChatMessage;
  onComplete?: (id: string) => void;
}

export const ChatMessage = ({ message, onComplete }: IProps) => {
  const isUser = message.role === ChatRole.USER;
  const isAssistant = message.role === ChatRole.ASSISTANT;
  return (
    <View
      className={cn("mb-12 items-start", {
        "items-end": isUser,
      })}
    >
      <View
        className={cn("max-w-[86%] flex-row items-end gap-8", {
          "flex-row-reverse": isUser,
        })}
      >
        {isAssistant && (
          <View className="h-32 w-32 items-center justify-center rounded-full bg-feature-ai-surface">
            <Image
              contentFit="contain"
              className="h-24 w-24"
              source={require("@/assets/images/doctor-avatar.png")}
            />
          </View>
        )}
        <View
          className={cn("rounded-22 px-14 py-10", {
            "rounded-br-0 rounded-8 bg-action-primary": isUser,
            "rounded-bl-0 rounded-8 border border-line-subtle bg-background-surface":
              isAssistant,
          })}
        >
          {isAssistant ? (
            <TypingMessage
              value={message.content}
              isTyping={message.typingCompleted === false}
              onComplete={() => onComplete?.(message.id)}
              speed={250}
            />
          ) : (
            <Body variant="body3" className="text-action-primary-foreground">
              {message.content}
            </Body>
          )}
          <Text
            variant="caption2"
            className={cn("mt-6 self-end text-text-subtle", {
              "text-action-primary-foreground opacity-80": isUser,
            })}
          >
            {date(message.timestamp).fromNow()}
          </Text>
        </View>
      </View>
    </View>
  );
};
