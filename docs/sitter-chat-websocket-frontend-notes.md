# Sitter Booking Realtime Chat: Mobile Notes

## Existing UI audit

Sitter messages previously lived in a scrollable bottom sheet and used HTTP-only query invalidation. The new entry point opens a dedicated Expo Router screen at `/sitter-bookings/[id]/chat`, which gives the message list, keyboard, and safe-area composer predictable space.

## Client structure

- `features/sitter/chat/sitterChat.types.ts`: typed event and local message contract.
- `features/sitter/chat/sitterChatSocket.ts`: namespace URL construction and Socket.IO client options.
- `features/sitter/chat/useSitterChat.ts`: history reconciliation, socket lifecycle, room join/leave, optimistic state, acknowledgements, deduplication, fallback, retry, foreground/background handling, and reconnect refetch.
- `features/sitter/screens/SitterBookingChatScreen.tsx`: booking context, virtualized message list, connection/error states, bubbles, retry interaction, new-message affordance, and safe-area composer.

The REST API base URL includes `/api/v1`; the socket helper removes that suffix before connecting to the server namespace `/sitter-bookings/chat`.

## Delivery behavior

1. HTTP loads durable history.
2. Opening the screen creates the authenticated socket and joins the booking room.
3. Send inserts a local message keyed by UUID `clientMessageId`.
4. Socket acknowledgement or `newMessage` replaces the optimistic row without duplication.
5. If the socket is not joined, send automatically uses HTTP with the same idempotency key.
6. If an acknowledgement does not arrive within eight seconds, HTTP safely reconciles the send.
7. A server error marks the message failed and keeps its text available for tap-to-retry.
8. Reconnect rejoins and refetches HTTP history to recover messages missed while offline.

## UI and QA checklist

- Dedicated screen is available from confirmed, active, and completed booking details.
- Loading, empty, history, pending, sent, failed, offline, reconnecting, and history-error states are represented.
- Message state uses labels/icons as well as color.
- Send and new-message controls meet 44-point touch targets.
- Semantic NativeWind tokens support light and dark mode.
- `KeyboardAvoidingView`, bottom safe-area padding, and a virtualized `FlatList` protect the composer and long histories.
- Manual two-account realtime, keyboard, background/foreground, dark-mode, and network-loss checks remain part of release QA.
