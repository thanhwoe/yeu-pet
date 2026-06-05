import { PaywallNotice } from "@/components/PaywallNotice";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { ChatMessage } from "@/features/ai/components/ChatMessage";
import { LoadingMessage } from "@/features/ai/components/LoadingMessage";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
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
  const { entitlements, getLimitState, isPremium, isUpgrading, upgrade } =
    useEntitlements();
  const aiLimit = getLimitState("aiMessagesPerMonth");

  const handleSendMessage = async (message: string) => {
    if (!aiLimit.allowed) {
      return;
    }

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
      {!isPremium && (
        <View className="pb-12">
          <PaywallNotice
            compact
            title={
              aiLimit.allowed
                ? "Limited AI quota"
                : "AI message limit reached"
            }
            description={
              aiLimit.allowed
                ? `${aiLimit.remaining ?? 0} of ${aiLimit.limit ?? entitlements?.limits.aiMessagesPerMonth ?? 0} free AI messages remaining this month. Premium unlocks pet context and medical history.`
                : `You have used ${entitlements?.usage.aiMessagesThisMonth ?? aiLimit.usage} of ${aiLimit.limit} free AI messages this month.`
            }
            loading={isUpgrading}
            onAction={() => upgrade()}
          />
        </View>
      )}
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
      <MessageInput onSubmit={handleSendMessage} disabled={!aiLimit.allowed} />
    </View>
  );
};

const SendIcon = withIconClassName(PaperPlaneTiltIcon);

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}
const MessageInput = ({ onSubmit, disabled }: MessageInputProps) => {
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
            editable={!disabled && (!loading || !isGeneratingMessage)}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            onSubmit(value);
            setValue("");
          }}
          disabled={disabled || loading || isGeneratingMessage}
          className="self-end mb-1 items-center justify-center p-2 rounded-full bg-background-secondary"
        >
          <SendIcon className="text-icon-foreground" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
