import { Spinner } from "@/components/ui/Spinner";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import { STATUS_COPY } from "@/features/sitter/constants";
import { useSitterBookingDetail } from "@/features/sitter/useSitters";
import {
  getBookingPetName,
  getBookingSitterName,
  getOwnerName,
} from "@/features/sitter/utils";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { useLocalSearchParams } from "expo-router";
import {
  ArrowDownIcon,
  CheckIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { LocalChatMessage } from "../chat/sitterChat.types";
import { useSitterChat } from "../chat/useSitterChat";

const ArrowDown = withIconClassName(ArrowDownIcon);
const Check = withIconClassName(CheckIcon);
const PaperPlaneTilt = withIconClassName(PaperPlaneTiltIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

const CONNECTION_COPY = {
  connecting: "Connecting to booking chat…",
  reconnecting: "Reconnecting and checking for new messages…",
  offline: "Offline. New messages will use secure fallback delivery.",
} as const;

export const SitterBookingChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = typeof id === "string" ? id : "";
  const bookingQuery = useSitterBookingDetail(bookingId);
  const {
    messages,
    messagesQuery,
    connectionState,
    lastError,
    currentUserId,
    sendMessage,
    retryMessage,
  } = useSitterChat(bookingId);
  const [draft, setDraft] = useState("");
  const [nearBottom, setNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const listRef = useRef<FlatList<LocalChatMessage>>(null);
  const previousCountRef = useRef(0);

  const booking = bookingQuery.data;
  const isOwner = booking?.accountId === currentUserId;
  const partnerName = booking
    ? isOwner
      ? getBookingSitterName(booking)
      : getOwnerName(booking.owner)
    : "Booking chat";

  useEffect(() => {
    if (messages.length > previousCountRef.current) {
      if (nearBottom) {
        requestAnimationFrame(() =>
          listRef.current?.scrollToEnd({ animated: true }),
        );
      } else {
        setShowNewMessages(true);
      }
    }
    previousCountRef.current = messages.length;
  }, [messages.length, nearBottom]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const nextNearBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height) < 96;
    setNearBottom(nextNearBottom);
    if (nextNearBottom) setShowNewMessages(false);
  };

  const submit = () => {
    if (sendMessage(draft)) setDraft("");
  };

  const renderMessage = useCallback<ListRenderItem<LocalChatMessage>>(
    ({ item }) => {
      const isOwn = item.senderAccountId === currentUserId;
      const failed = item.localStatus === "failed";
      const bubble = (
        <View
          className={cn(
            "max-w-[84%] gap-4 rounded-20 px-14 py-10",
            isOwn
              ? "self-end bg-action-primary"
              : "self-start border border-line-subtle bg-background-surface",
            failed &&
              "border border-status-danger-border bg-status-danger-surface",
          )}
        >
          <Body
            variant="body3"
            className={cn(
              isOwn ? "text-action-primary-foreground" : "text-text-primary",
              failed && "text-status-danger-text",
            )}
          >
            {item.content}
          </Body>
          <View
            className={cn(
              "flex-row items-center gap-4",
              isOwn && "justify-end",
            )}
          >
            <Body
              variant="body5"
              className={cn(
                isOwn ? "text-action-primary-foreground/75" : "text-text-muted",
                failed && "text-status-danger-text",
              )}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Body>
            {item.localStatus === "pending" ? (
              <Spinner size={12} className="text-action-primary-foreground" />
            ) : failed ? (
              <>
                <WarningCircle
                  size={13}
                  weight="fill"
                  className="text-status-danger-icon"
                />
                <Body
                  variant="body5"
                  weight="semiBold"
                  className="text-status-danger-text"
                >
                  Tap to retry
                </Body>
              </>
            ) : isOwn ? (
              <Check
                size={13}
                weight="bold"
                className="text-action-primary-foreground"
              />
            ) : null}
          </View>
        </View>
      );

      return failed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry failed message"
          onPress={() => retryMessage(item)}
        >
          {bubble}
        </Pressable>
      ) : (
        bubble
      );
    },
    [currentUserId, retryMessage],
  );

  if (!bookingId) {
    return (
      <StateView
        variant="error"
        title="Booking chat unavailable"
        description="Open this chat again from a booking."
        className="flex-1 bg-background"
      />
    );
  }

  if (bookingQuery.isLoading)
    return (
      <StateView
        variant="loading"
        title="Opening booking chat"
        className="flex-1 bg-background"
      />
    );

  if (bookingQuery.isError || !booking) {
    return (
      <StateView
        variant="error"
        title="Booking chat could not open"
        description="Check the booking and try again."
        actionLabel="Retry"
        className="flex-1 bg-background"
        onAction={() => bookingQuery.refetch()}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}
    >
      <View className="gap-2 border-b border-line-subtle bg-background-surface px-16 pb-12 pt-4">
        <Body variant="body2" weight="semiBold" numberOfLines={1}>
          {partnerName}
        </Body>
        <Body variant="body4" className="text-text-muted" numberOfLines={1}>
          {getBookingPetName(booking)} · {STATUS_COPY[booking.status]}
        </Body>
      </View>

      {connectionState !== "connected" ? (
        <View className="border-b border-status-warning-border bg-status-warning-surface px-16 py-8">
          <Body variant="body4" className="text-status-warning-text">
            {CONNECTION_COPY[connectionState]}
          </Body>
        </View>
      ) : null}

      {lastError ? (
        <View className="border-b border-status-danger-border bg-status-danger-surface px-16 py-8">
          <Body variant="body4" className="text-status-danger-text">
            {lastError}
          </Body>
        </View>
      ) : null}

      {messagesQuery.isLoading && !messages.length ? (
        <StateView
          variant="loading"
          title="Loading messages"
          className="flex-1"
        />
      ) : messagesQuery.isError && !messages.length ? (
        <StateView
          variant="error"
          title="Messages could not load"
          description="Your draft is safe. Try loading the thread again."
          actionLabel="Retry"
          onAction={() => messagesQuery.refetch()}
          className="flex-1"
        />
      ) : (
        <View className="flex-1">
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerClassName={cn(
              "gap-10 px-16 py-16",
              !messages.length && "flex-1",
            )}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={100}
            ListEmptyComponent={
              <StateView
                variant="empty"
                title="Start the conversation"
                description="Confirm care instructions, arrival details, or anything your sitter should know."
                className="flex-1"
              />
            }
          />
          {showNewMessages ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Show new messages"
              className="absolute bottom-12 self-center flex-row items-center gap-6 rounded-full bg-action-primary px-14 py-10"
              onPress={() => {
                listRef.current?.scrollToEnd({ animated: true });
                setShowNewMessages(false);
              }}
            >
              <ArrowDown
                size={16}
                weight="bold"
                className="text-action-primary-foreground"
              />
              <Body
                variant="body4"
                weight="semiBold"
                className="text-action-primary-foreground"
              >
                New messages
              </Body>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View className="gap-6 border-t border-line-subtle bg-background px-16 pb-safe pt-10">
        <View className="min-h-54 flex-row items-end gap-10 rounded-24 border border-line-subtle bg-background-surface px-14 py-8">
          <TextInput
            accessibilityLabel="Booking message"
            autoCorrect
            className="max-h-120 min-h-38 flex-1 py-8 text-body2 text-text-primary placeholder:text-text-placeholder selection:text-text-link"
            maxLength={2000}
            multiline
            onChangeText={setDraft}
            placeholder="Share care or arrival details…"
            textAlignVertical="top"
            value={draft}
          />
          <TouchableOpacity
            accessibilityLabel="Send booking message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !draft.trim() }}
            activeOpacity={0.82}
            className={cn(
              "h-44 w-44 items-center justify-center rounded-full bg-action-primary",
              !draft.trim() && "bg-background-surface-muted",
            )}
            disabled={!draft.trim()}
            onPress={submit}
          >
            <PaperPlaneTilt
              size={20}
              weight="fill"
              className={
                draft.trim()
                  ? "text-action-primary-foreground"
                  : "text-icon-secondary"
              }
            />
          </TouchableOpacity>
        </View>
        <Body variant="body5" className="text-right text-text-muted">
          {draft.length}/2000
        </Body>
      </View>
    </KeyboardAvoidingView>
  );
};
