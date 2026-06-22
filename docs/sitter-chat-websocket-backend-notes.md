# Sitter Booking Realtime Chat: Backend Notes

## Existing architecture

- Sitter booking messages already used `GET` and `POST /sitter-bookings/:id/messages`.
- `SitterBookingMessagesService` and its Prisma repository remain the shared HTTP source of truth.
- Booking authorization is centralized through `SitterBookingsService.findOne`: the current account must be the booking owner or the sitter account.
- JWT HTTP auth uses `JwtStrategy`, `JwtService`, and `UsersService`. Socket auth reuses the same signing configuration and active-account lookup.
- Redis infrastructure exists for cache, queues, and the internal event bus. The Socket.IO Redis adapter is not enabled for this single-instance MVP.
- The notifications module stores in-app notifications and delivers Firebase push notifications to active devices.

## Schema and idempotency

Migration `20260620000000_add_sitter_chat_idempotency` adds:

- `client_message_id VARCHAR(128)`
- `updated_at TIMESTAMPTZ(6)`
- unique index on `(booking_id, sender_id, client_message_id)`

PostgreSQL permits multiple `NULL` values in this unique index, so legacy HTTP messages remain compatible. Both HTTP and WebSocket sends now accept `clientMessageId`; duplicate retries return the existing persisted message.

## WebSocket contract

- Socket.IO namespace: `/sitter-bookings/chat`
- Room: `sitter-booking:${bookingId}` (constructed only by the server)
- Client events: `sitterChat:join`, `sitterChat:leave`, `sitterChat:sendMessage`
- Server events: `sitterChat:joined`, `sitterChat:newMessage`, `sitterChat:messageAck`, `sitterChat:error`
- JWT is read only from `handshake.auth.token`.
- The gateway is exempted from HTTP Passport/throttler guards because those guards expect an HTTP request. Namespace middleware performs JWT and active-account validation before connection, and the gateway applies a chat-specific limit of 20 messages per minute per booking/account.
- Join and send both re-check participant permission. A message is stored before `newMessage` and `messageAck` are emitted.
- Message content is trimmed, plain text, required for text messages, and limited to the existing 2,000-character API convention.
- User-created `system` messages are rejected. Sending is available only for confirmed, active, and completed bookings.
- Expired in-memory rate-limit buckets are pruned, and socket logs include connection, room, persistence, and normalized error metadata without message content or JWTs.

## Runtime configuration

- Nest's HTTP `API_PREFIX` and URI version (`/api/v1`) do not prefix Socket.IO namespaces. Clients connect to the server origin plus `/sitter-bookings/chat`; the Socket.IO transport path remains the default `/socket.io`.
- Backend and mobile both force the `websocket` transport for this MVP. The reverse proxy must forward WebSocket upgrade headers and allow long-lived connections.
- The gateway CORS policy mirrors the API's current permissive CORS setup. If browser origins are restricted later, update HTTP and Socket.IO CORS together; native mobile clients are not protected by browser CORS.
- Global HTTP tracking/error interceptors explicitly skip WebSocket contexts. Socket events use gateway logging instead.

## HTTP and notifications

The existing HTTP history and send routes are preserved and now return the same normalized message DTO as WebSocket events. Page 1 queries the newest messages and returns that page in chronological display order. After a new message is persisted, the recipient receives an in-app notification with deep link `/sitter-bookings/{bookingId}/chat`. Idempotent retries do not generate another notification.

Push respects the recipient's master and sitter-booking notification settings, ignores inactive devices, and only sends Firebase-compatible device tokens through Firebase Admin. The current mobile registration path stores Expo push tokens, so those tokens are intentionally not sent to Firebase; aligning the mobile token provider or adding Expo Push delivery remains a separate notification-platform follow-up.

## Deployment

The current implementation is suitable for one API instance. Rooms and message throttles are process-local. A horizontally scaled deployment must add `@socket.io/redis-adapter`, initialize it during bootstrap, move throttling to shared storage, and configure the load balancer for WebSocket upgrades and a suitable idle timeout. HTTP fallback must remain enabled during rollout.
