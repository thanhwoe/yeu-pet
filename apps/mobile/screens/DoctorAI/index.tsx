import { ChatMessage } from "@/components/ChatMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IChatMessage } from "@/interfaces";
import { useChatStore, useUserInfoStore } from "@/stores";
import { useHeaderHeight } from "@react-navigation/elements";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const DoctorAIScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const { messages, sendMessage, markTypingComplete, loading } = useChatStore();
  const userInfo = useUserInfoStore.use.user();

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (e) {
      console.log({ e });
    }
  };

  const handleTypingComplete = (id: string) => {
    markTypingComplete(id);
  };

  const renderMessage = ({ item }: { item: IChatMessage | boolean }) => {
    if (typeof item === "boolean") {
      return item ? <LoadingMessage /> : null;
    }
    return <ChatMessage message={item} onComplete={handleTypingComplete} />;
  };

  const renderListEmptyComponent = () => {
    return (
      <View className="items-center gap-3">
        <Image
          contentFit="contain"
          className="size-56"
          source={require("@/assets/images/ai-doctor.png")}
        />
        <Text variant="title2" className="text-center">
          Hi {userInfo?.firstName} {userInfo?.lastName}, how can I help you
          today?
        </Text>
      </View>
    );
  };

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages]);

  return (
    <View className="flex-1 bg-background-screen px-5 pb-safe-or-2">
      <FlatList
        ref={flatListRef}
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        data={loading ? [...messages, true] : messages}
        renderItem={renderMessage}
        bounces={false}
        keyExtractor={(item, index) => String(item) + String(index)}
        ListEmptyComponent={renderListEmptyComponent}
      />
      <MessageInput onSubmit={handleSendMessage} />
    </View>
  );
};

const SendIcon = withIconClassName(PaperPlaneTiltIcon);

interface MessageInputProps {
  onSubmit: (message: string) => void;
}
const MessageInput = ({ onSubmit }: MessageInputProps) => {
  const [value, setValue] = useState("");
  const headerHeight = useHeaderHeight();
  const { messages, loading } = useChatStore();

  const isGeneratingMessage = messages.some(
    (message) => message.role === "assistant" && !message.typingCompleted
  );

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={headerHeight}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-row gap-3 items-center justify-between pr-1 border border-line-secondary rounded-3xl bg-background-white">
        <View className="flex-1">
          <TextInput
            className="px-3 py-3 text-base placeholder:text-text-secondary selection:text-text-link"
            multiline
            placeholder={loading ? "Thinking..." : "Ask me anything..."}
            value={value}
            onChangeText={setValue}
            autoCorrect={false}
            textAlignVertical="top"
            editable={!loading || !isGeneratingMessage}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            onSubmit(value);
            setValue("");
          }}
          disabled={loading || isGeneratingMessage}
          className="self-end mb-1 items-center justify-center p-2 rounded-full bg-background-secondary"
        >
          <SendIcon className="text-icon-foreground" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
