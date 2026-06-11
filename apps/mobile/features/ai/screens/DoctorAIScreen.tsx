import { PaywallNotice } from "@/components/PaywallNotice";
import { Avatar } from "@/components/ui/Avatar";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { PET_KEY } from "@/constants/query-keys";
import { ChatMessage } from "@/features/ai/components/ChatMessage";
import { LoadingMessage } from "@/features/ai/components/LoadingMessage";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IChatMessage, IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { useChatStore, useUserInfoStore } from "@/stores";
import { cn } from "@/utils";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const DoctorAIScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const { messages, sendMessage, markTypingComplete, loading } = useChatStore();
  const userInfo = useUserInfoStore.use.user();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const petsQuery = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });
  const pets = petsQuery.data?.data ?? [];
  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const { entitlements, getLimitState, isPremium, isUpgrading, upgrade } =
    useEntitlements();
  const aiLimit = getLimitState("aiMessagesPerMonth");

  const handleSendMessage = async (message: string) => {
    if (!aiLimit.allowed) {
      return;
    }

    try {
      await sendMessage(message, {
        petId: selectedPetId,
        context: selectedPet ? `Pet context: ${selectedPet.name}` : undefined,
      });
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
          Hi {userInfo?.firstName} {userInfo?.lastName}, what would you like
          help with today?
        </Text>
        <Body variant="body3" className="text-center text-text-tertiary-inverse">
          Ask about feeding, grooming, behavior, medication reminders, or
          symptoms. For urgent symptoms, contact a veterinarian immediately.
        </Body>
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
      <SafetyNotice />
      <PetContextSelector
        pets={pets}
        loading={petsQuery.isLoading}
        selectedPetId={selectedPetId}
        onChange={setSelectedPetId}
      />
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

const SafetyNotice = () => (
  <View className="mb-12 rounded-20 bg-background-card-highlight px-14 py-12">
    <Body variant="body3" weight="semiBold">
      Pet Care AI is guidance, not a diagnosis
    </Body>
    <Body variant="body4" className="mt-4 text-text-tertiary-inverse">
      If your pet has trouble breathing, seizures, poisoning, heavy bleeding, or
      extreme weakness, contact a veterinarian or emergency clinic now.
    </Body>
  </View>
);

const PetContextSelector = ({
  pets,
  loading,
  selectedPetId,
  onChange,
}: {
  pets: IPet[];
  loading: boolean;
  selectedPetId: string | null;
  onChange: (petId: string | null) => void;
}) => {
  if (loading || !pets.length) {
    return null;
  }

  return (
    <View className="mb-12 gap-8">
      <Body variant="body3" weight="semiBold">
        Pet context
      </Body>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-10"
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ask without pet context"
          accessibilityState={{ selected: selectedPetId === null }}
          onPress={() => onChange(null)}
          className={cn(
            "h-42 justify-center rounded-full border border-line-secondary px-14",
            selectedPetId === null && "bg-background-primary",
          )}
        >
          <Body
            variant="body3"
            weight="semiBold"
            className={cn(selectedPetId === null && "text-text-primary-inverse")}
          >
            General
          </Body>
        </TouchableOpacity>
        {pets.map((pet) => {
          const selected = selectedPetId === pet.id;

          return (
            <TouchableOpacity
              key={pet.id}
              accessibilityRole="button"
              accessibilityLabel={`Use ${pet.name} as AI pet context`}
              accessibilityState={{ selected }}
              onPress={() => onChange(pet.id)}
              className={cn(
                "h-42 flex-row items-center gap-8 rounded-full border border-line-secondary px-10",
                selected && "bg-background-primary",
              )}
            >
              <Avatar size="small" source={{ uri: pet.avatarUrl ?? "" }} />
              <Body
                variant="body3"
                weight="semiBold"
                className={cn(selected && "text-text-primary-inverse")}
              >
                {pet.name}
              </Body>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}
const MessageInput = ({ onSubmit, disabled }: MessageInputProps) => {
  const [value, setValue] = useState("");
  const headerHeight = useHeaderHeight();
  const { messages, loading } = useChatStore();
  const trimmedValue = value.trim();

  const isGeneratingMessage = messages.some(
    (message) => message.role === "assistant" && !message.typingCompleted
  );
  const inputDisabled =
    disabled || loading || isGeneratingMessage || !trimmedValue;

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
          accessibilityRole="button"
          accessibilityLabel="Send AI message"
          accessibilityState={{ disabled: inputDisabled }}
          onPress={() => {
            onSubmit(trimmedValue);
            setValue("");
          }}
          disabled={inputDisabled}
          className={cn(
            "self-end mb-1 items-center justify-center rounded-full bg-background-secondary p-2",
            inputDisabled && "opacity-50",
          )}
        >
          <SendIcon className="text-icon-foreground" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
