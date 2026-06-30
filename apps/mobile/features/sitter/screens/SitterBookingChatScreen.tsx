import {
  AppKeyboardChatScrollView,
  AppKeyboardStickyView,
} from "@/components/keyboard";
import { Spinner } from "@/components/ui/Spinner";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import {
  getBookingStatusLabel,
  isSitterBookingChatActive,
  isSitterBookingTerminal,
} from "@/features/sitter/constants";
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
import { useTranslation } from "react-i18next";
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollViewProps,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import type { LocalChatMessage } from "../chat/sitterChat.types";
import { useSitterChat } from "../chat/useSitterChat";

const ArrowDown = withIconClassName(ArrowDownIcon);
const Check = withIconClassName(CheckIcon);
const PaperPlaneTilt = withIconClassName(PaperPlaneTiltIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

export const SitterBookingChatScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = typeof id === "string" ? id : "";
  const bookingQuery = useSitterBookingDetail(bookingId);
  const booking = bookingQuery.data;
  const canSendMessages = booking
    ? isSitterBookingChatActive(booking.status)
    : false;
  const {
    messages,
    messagesQuery,
    connectionState,
    lastError,
    currentUserId,
    sendMessage,
    retryMessage,
  } = useSitterChat(bookingId, { canSend: canSendMessages });
  const [draft, setDraft] = useState("");
  const [nearBottom, setNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const listRef = useRef<FlatList<LocalChatMessage>>(null);
  const previousCountRef = useRef(0);
  const footerHeight = useSharedValue(0);
  const [footerOffset, setFooterOffset] = useState(0);

  const isOwner = booking?.accountId === currentUserId;
  const partnerName = booking
    ? isOwner
      ? getBookingSitterName(booking)
      : getOwnerName(booking.owner)
    : t("sitter.booking.chat.fallbackTitle");
  const connectionCopy = {
    connecting: t("sitter.booking.chat.connecting"),
    reconnecting: t("sitter.booking.chat.reconnecting"),
    offline: t("sitter.booking.chat.offline"),
  } as const;
  const readOnlyNotice = booking
    ? booking.status === "completed"
      ? t("sitter.booking.chat.completedNotice")
      : isSitterBookingTerminal(booking.status)
        ? t("sitter.booking.chat.closedNotice")
        : t("sitter.booking.chat.pendingNotice")
    : undefined;

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
    if (!canSendMessages) return;
    if (sendMessage(draft)) setDraft("");
  };

  const handleFooterLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextHeight = event.nativeEvent.layout.height;
      footerHeight.value = nextHeight;
      setFooterOffset((currentHeight) =>
        Math.abs(currentHeight - nextHeight) < 1 ? currentHeight : nextHeight,
      );
    },
    [footerHeight],
  );

  const renderChatScrollComponent = useCallback(
    (props: ScrollViewProps) => (
      <AppKeyboardChatScrollView
        {...props}
        extraContentPadding={footerHeight}
        offset={footerOffset}
      />
    ),
    [footerHeight, footerOffset],
  );

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
                  {t("sitter.booking.chat.tapToRetry")}
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

      return failed && canSendMessages ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("sitter.accessibility.retryFailedMessage")}
          onPress={() => retryMessage(item)}
        >
          {bubble}
        </Pressable>
      ) : (
        bubble
      );
    },
    [canSendMessages, currentUserId, retryMessage, t],
  );

  if (!bookingId) {
    return (
      <StateView
        variant="error"
        title={t("sitter.booking.chat.unavailableTitle")}
        description={t("sitter.booking.chat.unavailableDescription")}
        className="flex-1 bg-background"
      />
    );
  }

  if (bookingQuery.isLoading)
    return (
      <StateView
        variant="loading"
        title={t("sitter.booking.chat.opening")}
        className="flex-1 bg-background"
      />
    );

  if (bookingQuery.isError || !booking) {
    return (
      <StateView
        variant="error"
        title={t("sitter.booking.chat.couldNotOpenTitle")}
        description={t("sitter.booking.chat.couldNotOpenDescription")}
        actionLabel={t("common.retry")}
        className="flex-1 bg-background"
        onAction={() => bookingQuery.refetch()}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="gap-2 border-b border-line-subtle bg-background-surface px-16 pb-12 pt-4">
        <Body variant="body2" weight="semiBold" numberOfLines={1}>
          {partnerName}
        </Body>
        <Body variant="body4" className="text-text-muted" numberOfLines={1}>
          {getBookingPetName(booking)} · {getBookingStatusLabel(booking.status)}
        </Body>
      </View>

      {connectionState !== "connected" ? (
        <View className="border-b border-status-warning-border bg-status-warning-surface px-16 py-8">
          <Body variant="body4" className="text-status-warning-text">
            {connectionCopy[connectionState]}
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

      {!canSendMessages && readOnlyNotice ? (
        <View className="border-b border-line-subtle bg-background-surface-muted px-16 py-8">
          <Body variant="body4" className="text-text-muted">
            {readOnlyNotice}
          </Body>
        </View>
      ) : null}

      {messagesQuery.isLoading && !messages.length ? (
        <StateView
          variant="loading"
          title={t("sitter.booking.chat.loadingMessages")}
          className="flex-1"
        />
      ) : messagesQuery.isError && !messages.length ? (
        <StateView
          variant="error"
          title={t("sitter.booking.chat.couldNotLoadTitle")}
          description={t("sitter.booking.chat.couldNotLoadDescription")}
          actionLabel={t("common.retry")}
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
            renderScrollComponent={renderChatScrollComponent}
            scrollEventThrottle={100}
            ListEmptyComponent={
              <StateView
                variant="empty"
                title={t("sitter.booking.chat.startTitle")}
                description={t("sitter.booking.chat.startDescription")}
                className="flex-1"
              />
            }
          />
          {showNewMessages ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("sitter.accessibility.showNewMessages")}
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
                {t("sitter.booking.chat.newMessages")}
              </Body>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {canSendMessages ? (
        <AppKeyboardStickyView
          includeBottomInset={false}
          onLayout={handleFooterLayout}
        >
          <View className="gap-6 border-t border-line-subtle bg-background px-16 pb-safe pt-10">
            <View className="min-h-54 flex-row items-end gap-10 rounded-24 border border-line-subtle bg-background-surface px-14 py-8">
              <TextInput
                accessibilityLabel={t("sitter.accessibility.bookingMessage")}
                autoCorrect
                className="max-h-120 min-h-38 flex-1 py-8 text-body2 text-text-primary placeholder:text-text-placeholder selection:text-text-link"
                maxLength={2000}
                multiline
                onChangeText={setDraft}
                placeholder={t("sitter.booking.chat.placeholder")}
                textAlignVertical="top"
                value={draft}
              />
              <TouchableOpacity
                accessibilityLabel={t(
                  "sitter.accessibility.sendBookingMessage",
                )}
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
        </AppKeyboardStickyView>
      ) : null}
    </View>
  );
};
