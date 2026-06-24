import { PaywallNotice } from "@/components/PaywallNotice";
import { Avatar } from "@/components/ui/Avatar";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { PET_KEY } from "@/constants/query-keys";
import { ChatMessage } from "@/features/ai/components/ChatMessage";
import { LoadingMessage } from "@/features/ai/components/LoadingMessage";
import { useDoctorAiChat } from "@/features/ai/hooks";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IChatMessage, IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { useUserInfoStore } from "@/stores";
import { cn } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import {
  LockKeyIcon,
  PaperPlaneTiltIcon,
  PawPrintIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SendIcon = withIconClassName(PaperPlaneTiltIcon);
const LockKey = withIconClassName(LockKeyIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);
const PawPrint = withIconClassName(PawPrintIcon);

const SUGGESTED_PROMPTS = [
  "My pet is not eating",
  "Is this symptom urgent?",
  "Build a feeding routine",
  "Explain vaccine schedule",
  "Grooming tips",
  "Medication reminder help",
];

const URGENT_KEYWORDS =
  /\b(can'?t breathe|difficulty breathing|gasping|choking|seizure|convulsion|poison|toxin|ate chocolate|xylitol|rat bait|bleeding heavily|won'?t stop bleeding|collapsed|unconscious|extreme weakness|hit by car)\b/i;

type LoadingItem = { id: "loading"; type: "loading" };
type ChatListItem = IChatMessage | LoadingItem;

export const DoctorAIScreen = () => {
  const flatListRef = useRef<FlatList<ChatListItem>>(null);
  const userInfo = useUserInfoStore.use.user();
  const [composerValue, setComposerValue] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const petsQuery = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });
  const pets = petsQuery.data?.data ?? [];
  const {
    entitlements,
    getLimitState,
    isPremium,
    isLoading: isEntitlementsLoading,
    isUpgrading,
    upgrade,
  } = useEntitlements();
  const aiLimit = getLimitState("aiMessagesPerMonth");
  const canUsePetContext = Boolean(
    isPremium && entitlements?.limits.aiWithPetContext,
  );
  const effectivePetId = canUsePetContext ? selectedPetId : null;
  const {
    isLoadingHistory,
    loading,
    markTypingComplete,
    messages,
    sendMessage,
  } = useDoctorAiChat({ petId: effectivePetId });
  const isGeneratingMessage =
    loading ||
    isLoadingHistory ||
    messages.some(
      (message) =>
        message.role === "assistant" && message.typingCompleted === false,
    );
  const quotaExhausted = !aiLimit.allowed;

  const listData = useMemo<ChatListItem[]>(
    () =>
      loading || (isLoadingHistory && !messages.length)
        ? [...messages, { id: "loading", type: "loading" }]
        : messages,
    [isLoadingHistory, loading, messages],
  );

  useEffect(() => {
    if (selectedPetId && !pets.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(null);
    }
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (listData.length > 0) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [listData.length]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage || quotaExhausted || isGeneratingMessage) {
        return;
      }

      await sendMessage(trimmedMessage);
    },
    [isGeneratingMessage, quotaExhausted, sendMessage],
  );

  const handleSubmitComposer = useCallback(async () => {
    const nextMessage = composerValue.trim();
    if (!nextMessage) {
      return;
    }

    setComposerValue("");
    await handleSendMessage(nextMessage);
  }, [composerValue, handleSendMessage]);

  const handlePromptPress = useCallback((prompt: string) => {
    setComposerValue(prompt);
  }, []);

  const handleTypingComplete = useCallback(
    (id: string) => {
      markTypingComplete(id);
    },
    [markTypingComplete],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatListItem }) => {
      if ("type" in item) {
        return <LoadingMessage />;
      }

      return <ChatMessage message={item} onComplete={handleTypingComplete} />;
    },
    [handleTypingComplete],
  );

  const listHeader = useMemo(
    () => (
      <View className="gap-12 pb-14">
        <PetContextSelector
          canUsePetContext={canUsePetContext}
          loading={petsQuery.isLoading}
          onChange={setSelectedPetId}
          onLockedPress={() => upgrade()}
          pets={pets}
          selectedPetId={canUsePetContext ? selectedPetId : null}
        />
        {!quotaExhausted ? (
          <QuotaCard
            isPremium={isPremium}
            limit={aiLimit.limit}
            loading={isEntitlementsLoading}
            onUpgrade={() => void upgrade()}
            remaining={aiLimit.remaining}
            upgrading={isUpgrading}
            usage={aiLimit.usage}
          />
        ) : null}
      </View>
    ),
    [
      aiLimit.limit,
      aiLimit.remaining,
      aiLimit.usage,
      canUsePetContext,
      isEntitlementsLoading,
      isPremium,
      isUpgrading,
      pets,
      petsQuery.isLoading,
      quotaExhausted,
      selectedPetId,
      upgrade,
    ],
  );

  const emptyState = useMemo(
    () => (
      <EmptyChatState
        firstName={userInfo?.firstName}
        onPromptPress={handlePromptPress}
      />
    ),
    [handlePromptPress, userInfo?.firstName],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-16">
        <FlatList
          ref={flatListRef}
          className="flex-1"
          contentContainerClassName="pb-18"
          data={listData}
          keyExtractor={(item, index) =>
            ("type" in item ? item.id : item.id) + index
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={emptyState}
          ListHeaderComponent={listHeader}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {quotaExhausted ? (
        <View className="border-t border-line-subtle bg-background px-16 pb-safe pt-10">
          <PaywallNotice
            variant="blocking"
            title="AI message limit reached"
            description="You have used your free AI messages for this month. Upgrade to Premium for more Pet Care AI support."
            benefits={[
              "300 AI messages each month",
              "AI with pet context",
              "AI with medical history context",
            ]}
            loading={isUpgrading}
            onAction={() => void upgrade()}
          />
        </View>
      ) : (
        <MessageComposer
          disabled={isGeneratingMessage}
          loading={isGeneratingMessage}
          onChangeText={setComposerValue}
          onSubmit={handleSubmitComposer}
          value={composerValue}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const PetContextSelector = memo(
  ({
    pets,
    loading,
    selectedPetId,
    canUsePetContext,
    onChange,
    onLockedPress,
  }: {
    pets: IPet[];
    loading: boolean;
    selectedPetId: string | null;
    canUsePetContext: boolean;
    onChange: (petId: string | null) => void;
    onLockedPress: () => void;
  }) => (
    <View className="gap-8">
      <View className="flex-row items-center justify-between">
        <Body variant="body3" weight="semiBold" className="text-text-primary">
          Pet context
        </Body>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-8 pr-16"
      >
        <PetContextChip
          label="General"
          selected={selectedPetId === null}
          onPress={() => onChange(null)}
          accessibilityLabel="Use general AI context"
        />
        {loading ? (
          <View className="h-44 justify-center rounded-full border border-line-subtle bg-background-surface px-14">
            <Body variant="body4" className="text-text-muted">
              Loading pets...
            </Body>
          </View>
        ) : pets.length ? (
          pets.map((pet) => {
            const locked = !canUsePetContext;
            const selected = selectedPetId === pet.id && canUsePetContext;

            return (
              <PetContextChip
                key={pet.id}
                avatarUrl={pet.avatarUrl}
                label={pet.name}
                locked={locked}
                selected={selected}
                onPress={() => (locked ? onLockedPress() : onChange(pet.id))}
                accessibilityLabel={
                  locked
                    ? `${pet.name} pet context requires Premium`
                    : `Use ${pet.name} as AI pet context`
                }
              />
            );
          })
        ) : (
          <View className="h-44 flex-row items-center gap-8 rounded-full border border-line-subtle bg-background-surface px-14">
            <PawPrint size={18} className="text-icon-secondary" />
            <Body variant="body4" className="text-text-muted">
              No pets yet
            </Body>
          </View>
        )}
      </ScrollView>
    </View>
  ),
);

PetContextSelector.displayName = "PetContextSelector";

const PetContextChip = memo(
  ({
    label,
    selected,
    locked,
    avatarUrl,
    onPress,
    accessibilityLabel,
  }: {
    label: string;
    selected: boolean;
    locked?: boolean;
    avatarUrl?: string | null;
    onPress: () => void;
    accessibilityLabel: string;
  }) => (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: locked }}
      activeOpacity={0.82}
      className={cn(
        "h-44 flex-row items-center gap-8 rounded-full border border-line-subtle bg-background-surface px-12",
        selected && "border-line-highlight bg-action-primary",
        locked && "bg-background-surface-muted",
      )}
      onPress={onPress}
    >
      {avatarUrl ? (
        <View>
          <Avatar size="small" source={{ uri: avatarUrl }} />
        </View>
      ) : (
        <View
          className={cn(
            "h-28 w-28 items-center justify-center rounded-full bg-feature-ai-surface",
            selected && "bg-action-primary-foreground",
          )}
        >
          <PawPrint
            size={16}
            weight="fill"
            className={
              selected ? "text-action-primary" : "text-feature-ai-accent"
            }
          />
        </View>
      )}
      <Body
        variant="body4"
        weight="semiBold"
        className={cn(
          "text-text-primary",
          selected && "text-action-primary-foreground",
        )}
        numberOfLines={1}
      >
        {label}
      </Body>
      {locked ? <LockKey size={14} className="text-icon-secondary" /> : null}
    </TouchableOpacity>
  ),
);

PetContextChip.displayName = "PetContextChip";

const QuotaCard = memo(
  ({
    usage,
    limit,
    remaining,
    isPremium,
    loading,
    upgrading,
    onUpgrade,
  }: {
    usage?: number;
    limit?: number;
    remaining?: number;
    isPremium: boolean;
    loading: boolean;
    upgrading: boolean;
    onUpgrade: () => void;
  }) => {
    const safeLimit = limit ?? 0;
    const safeUsage = usage ?? 0;
    const safeRemaining = remaining ?? Math.max(0, safeLimit - safeUsage);
    const progress =
      safeLimit > 0 ? Math.min(100, (safeUsage / safeLimit) * 100) : 0;

    if (!loading && !isPremium) {
      return (
        <PaywallNotice
          variant="inline"
          title={`${safeRemaining} free AI messages remaining`}
          description="Premium adds more monthly messages plus pet and medical history context."
          actionLabel="See Premium"
          loading={upgrading}
          onAction={onUpgrade}
        />
      );
    }

    return (
      <View className="gap-10 rounded-20 border border-line-subtle bg-background-surface px-14 py-12 shadow-sm">
        <View className="flex-row items-start justify-between gap-12">
          <View className="flex-1 gap-2">
            <Body
              variant="body3"
              weight="semiBold"
              className="text-text-primary"
            >
              {loading ? "Checking AI messages" : "Premium AI"}
            </Body>
            <Body variant="body4" className="text-text-muted">
              {isPremium
                ? `${Math.max(0, safeLimit - safeUsage)} messages remaining this month with pet context.`
                : "Premium unlocks more messages, pet context, and recent medical history."}
            </Body>
          </View>
        </View>
        <View className="h-6 overflow-hidden rounded-full bg-background-surface-muted">
          <View
            className="h-full rounded-full bg-feature-ai-accent"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    );
  },
);

QuotaCard.displayName = "QuotaCard";

const EmptyChatState = memo(
  ({
    firstName,
    onPromptPress,
  }: {
    firstName?: string | null;
    onPromptPress: (prompt: string) => void;
  }) => (
    <View className="items-center gap-14 px-8 py-16">
      <Image
        contentFit="contain"
        className="h-78 w-78"
        source={require("@/assets/images/ai-doctor.png")}
      />
      <View className="gap-6">
        <Text variant="heading" className="text-center text-text-primary">
          Hi{firstName ? ` ${firstName}` : ""}, how can I help your pet today?
        </Text>
        <Text variant="body2" className="text-center text-text-muted">
          Ask for care information about feeding, grooming, behavior, medication
          routines, or symptoms.
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-center gap-8">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            accessibilityLabel={`Use suggested prompt: ${prompt}`}
            accessibilityRole="button"
            activeOpacity={0.82}
            className="min-h-38 justify-center rounded-full border border-line-subtle bg-background-surface px-12"
            onPress={() => onPromptPress(prompt)}
          >
            <Body
              variant="body4"
              weight="semiBold"
              className="text-text-primary"
            >
              {prompt}
            </Body>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ),
);

EmptyChatState.displayName = "EmptyChatState";

const MessageComposer = memo(
  ({
    value,
    disabled,
    loading,
    onChangeText,
    onSubmit,
  }: {
    value: string;
    disabled: boolean;
    loading: boolean;
    onChangeText: (value: string) => void;
    onSubmit: () => void;
  }) => {
    const trimmedValue = value.trim();
    const inputHasUrgentConcern = URGENT_KEYWORDS.test(value);
    const sendDisabled = disabled || !trimmedValue;

    return (
      <View className="gap-8 border-t border-line-subtle bg-background px-16 pb-safe pt-10">
        {inputHasUrgentConcern ? (
          <InlineWarning text="This may be urgent. Contact a veterinarian or emergency clinic now if your pet is in distress." />
        ) : null}
        <View
          className={cn(
            "min-h-54 flex-row items-end gap-10 rounded-24 border border-line-subtle bg-background-surface px-14 py-8",
            sendDisabled && "opacity-90",
          )}
        >
          <TextInput
            accessibilityLabel="Doctor AI message"
            autoCorrect
            className="max-h-120 min-h-38 flex-1 py-8 text-body2 text-text-primary placeholder:text-text-placeholder selection:text-text-link"
            editable={!loading}
            multiline
            onChangeText={onChangeText}
            placeholder={
              loading
                ? "Pet Care AI is thinking..."
                : "Ask about feeding, grooming, behavior, symptoms..."
            }
            textAlignVertical="top"
            value={value}
          />
          <TouchableOpacity
            accessibilityLabel="Send Doctor AI message"
            accessibilityRole="button"
            accessibilityState={{ disabled: sendDisabled, busy: loading }}
            activeOpacity={0.82}
            className={cn(
              "h-42 w-42 items-center justify-center rounded-full bg-action-primary",
              sendDisabled && "bg-background-surface-muted",
            )}
            disabled={sendDisabled}
            onPress={onSubmit}
          >
            <SendIcon
              size={20}
              weight="fill"
              className={
                sendDisabled
                  ? "text-icon-secondary"
                  : "text-action-primary-foreground"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

MessageComposer.displayName = "MessageComposer";

const InlineWarning = memo(({ text }: { text: string }) => (
  <View className="flex-row items-center gap-8 rounded-16 border border-status-warning-border bg-status-warning-surface px-12 py-9">
    <WarningCircle
      size={18}
      weight="fill"
      className="text-status-warning-icon"
    />
    <Body variant="body4" className="flex-1 text-status-warning-text">
      {text}
    </Body>
  </View>
));

InlineWarning.displayName = "InlineWarning";
