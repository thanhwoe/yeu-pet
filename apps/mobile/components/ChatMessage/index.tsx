import { ChatRole, IChatMessage } from "@/interfaces";
import { cn, date } from "@/utils";
import { View } from "react-native";
import { Markdown } from "../Markdown";
import { TypingMessage } from "../TypingMessage";
import { Image } from "../ui/Image";
import { Text } from "../ui/Text";

interface IProps {
  message: IChatMessage;
  onComplete?: (id: string) => void;
}

export const ChatMessage = ({ message, onComplete }: IProps) => {
  const isUser = message.role === ChatRole.USER;
  const isAssistant = message.role === ChatRole.ASSISTANT;
  return (
    <View
      className={cn("mb-4 items-start", {
        "items-end": isUser,
      })}
    >
      <View className={cn("flex-row items-end max-w-[80%] gap-1")}>
        {isAssistant && (
          <Image
            contentFit="contain"
            className="size-6"
            source={require("@/assets/images/doctor-avatar.png")}
          />
        )}
        <View
          className={cn("rounded-2xl px-4 py-3", {
            "bg-background-chat-right rounded-br-md": isUser,
            "bg-background-chat-left rounded-bl-md": isAssistant,
          })}
        >
          {isAssistant ? (
            <TypingMessage
              role={message.role}
              value={message.content}
              isTyping={!message.typingCompleted}
              onComplete={() => onComplete?.(message.id)}
              speed={250}
            />
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
          <Text
            variant="caption2"
            className={cn("self-end mt-2", {
              "self-start": isUser,
            })}
            color="secondary"
          >
            {date(message.timestamp).fromNow()}
          </Text>
        </View>
      </View>
    </View>
  );
};
