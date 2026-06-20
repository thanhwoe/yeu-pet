import { Public } from '@app/decorators/public.decorator';
import { IJwtPayload } from '@app/types/jwt';
import { UsersService } from '@app/modules/users/users.service';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SkipThrottle } from '@nestjs/throttler';
import { Namespace, Socket } from 'socket.io';
import { isUUID } from 'class-validator';
import { SitterBookingMessagesService } from './sitter-booking-messages.service';
import {
  SitterChatErrorCode,
  SitterChatErrorDto,
  SitterChatMessageDto,
} from './sitter-booking-chat.types';

const CHAT_NAMESPACE = '/sitter-bookings/chat';
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_MINUTE = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

export interface AuthenticatedSocketData {
  accountId: string;
}

interface BookingPayload {
  bookingId: string;
}

interface SendMessagePayload extends BookingPayload {
  clientMessageId: string;
  content: string;
}

interface SitterChatClientEvents {
  'sitterChat:join': (payload: BookingPayload) => void;
  'sitterChat:leave': (payload: BookingPayload) => void;
  'sitterChat:sendMessage': (payload: SendMessagePayload) => void;
}

interface SitterChatServerEvents {
  'sitterChat:joined': (payload: BookingPayload & { room: string }) => void;
  'sitterChat:newMessage': (payload: { message: SitterChatMessageDto }) => void;
  'sitterChat:messageAck': (
    payload: BookingPayload & {
      clientMessageId: string;
      message: SitterChatMessageDto;
    },
  ) => void;
  'sitterChat:error': (payload: SitterChatErrorDto) => void;
}

interface SitterChatInterServerEvents {
  'sitterChat:noop': () => void;
}

export type AuthenticatedSocket = Socket<
  SitterChatClientEvents,
  SitterChatServerEvents,
  SitterChatInterServerEvents,
  AuthenticatedSocketData
>;

export type SitterChatNamespace = Namespace<
  SitterChatClientEvents,
  SitterChatServerEvents,
  SitterChatInterServerEvents,
  AuthenticatedSocketData
>;

@Injectable()
@Public()
@SkipThrottle()
@WebSocketGateway({
  namespace: CHAT_NAMESPACE,
  cors: { origin: true, credentials: true },
  transports: ['websocket'],
})
export class SitterBookingChatGateway
  implements
    OnGatewayInit,
    OnGatewayConnection<AuthenticatedSocket>,
    OnGatewayDisconnect<AuthenticatedSocket>
{
  private readonly logger = new Logger(SitterBookingChatGateway.name);
  private readonly messageAttempts = new Map<string, number[]>();
  private lastRateLimitCleanupAt = Date.now();

  @WebSocketServer()
  private server!: SitterChatNamespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly messagesService: SitterBookingMessagesService,
  ) {}

  afterInit(server: SitterChatNamespace) {
    server.use((socket, next) => {
      void this.authenticateSocket(socket).then(
        () => next(),
        () => next(this.unauthorizedConnectionError()),
      );
    });
  }

  private async authenticateSocket(socket: AuthenticatedSocket) {
    const auth = socket.handshake.auth as Record<string, unknown>;
    const token = auth.token;
    if (typeof token !== 'string' || !token) {
      throw new Error('Missing token');
    }

    const payload = await this.jwtService.verifyAsync<IJwtPayload>(token);
    const account = await this.usersService.findById(payload.sub);
    if (!account?.is_active) {
      throw new Error('Inactive account');
    }

    socket.data.accountId = account.id;
  }

  private unauthorizedConnectionError() {
    const error = new Error('Unauthorized socket connection') as Error & {
      data?: SitterChatErrorDto;
    };
    error.data = {
      code: 'UNAUTHORIZED',
      message: 'Authentication is required to use booking chat.',
    };
    return error;
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Socket connected for account ${client.data.accountId}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.data.accountId) {
      this.logger.log(
        `Socket disconnected for account ${client.data.accountId}`,
      );
    }
  }

  @SubscribeMessage('sitterChat:join')
  async join(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: BookingPayload,
  ) {
    const bookingId = payload?.bookingId;
    try {
      this.assertBookingId(bookingId);
      await this.messagesService.assertBookingParticipant({
        bookingId,
        accountId: client.data.accountId,
      });
      const room = this.roomName(bookingId);
      await client.join(room);
      client.emit('sitterChat:joined', { bookingId, room });
      this.logger.log(
        `Account ${client.data.accountId} joined booking chat ${bookingId}`,
      );
    } catch (error) {
      this.emitError(client, error, { bookingId });
    }
  }

  @SubscribeMessage('sitterChat:leave')
  async leave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: BookingPayload,
  ) {
    const bookingId = payload?.bookingId;
    try {
      this.assertBookingId(bookingId);
      await client.leave(this.roomName(bookingId));
      this.logger.log(
        `Account ${client.data.accountId} left booking chat ${bookingId}`,
      );
    } catch (error) {
      this.emitError(client, error, { bookingId });
    }
  }

  @SubscribeMessage('sitterChat:sendMessage')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const bookingId = payload?.bookingId;
    const clientMessageId = payload?.clientMessageId;
    try {
      this.assertSendPayload(payload);
      await this.messagesService.assertBookingParticipant({
        bookingId,
        accountId: client.data.accountId,
      });
      this.assertWithinRateLimit(client.data.accountId, bookingId);
      const message = await this.messagesService.createMessage({
        bookingId,
        senderAccountId: client.data.accountId,
        content: payload.content,
        clientMessageId,
        source: 'websocket',
      });

      this.server.to(this.roomName(bookingId)).emit('sitterChat:newMessage', {
        message,
      });
      client.emit('sitterChat:messageAck', {
        bookingId,
        clientMessageId,
        message,
      });
      this.logger.log(
        `Message ${message.id} persisted for booking ${bookingId} by account ${client.data.accountId}`,
      );
    } catch (error) {
      this.emitError(client, error, { bookingId, clientMessageId });
    }
  }

  private assertBookingId(bookingId: unknown): asserts bookingId is string {
    if (typeof bookingId !== 'string' || !isUUID(bookingId)) {
      throw new BadRequestException('bookingId must be a valid UUID');
    }
  }

  private assertSendPayload(
    payload: SendMessagePayload,
  ): asserts payload is SendMessagePayload {
    this.assertBookingId(payload?.bookingId);
    if (
      typeof payload?.clientMessageId !== 'string' ||
      !payload.clientMessageId.trim() ||
      payload.clientMessageId.length > 128
    ) {
      throw new BadRequestException('clientMessageId is invalid');
    }
    if (typeof payload.content !== 'string' || !payload.content.trim()) {
      throw new BadRequestException('Message content is required');
    }
    if (payload.content.trim().length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      );
    }
  }

  private assertWithinRateLimit(accountId: string, bookingId: string) {
    const now = Date.now();
    this.pruneExpiredRateLimits(now);
    const key = `${accountId}:${bookingId}`;
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    const recentAttempts = (this.messageAttempts.get(key) ?? []).filter(
      (attempt) => attempt > cutoff,
    );
    if (recentAttempts.length >= MAX_MESSAGES_PER_MINUTE) {
      throw new SitterChatRateLimitError();
    }
    recentAttempts.push(now);
    this.messageAttempts.set(key, recentAttempts);
  }

  private pruneExpiredRateLimits(now: number) {
    if (now - this.lastRateLimitCleanupAt < RATE_LIMIT_WINDOW_MS) return;

    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, attempts] of this.messageAttempts) {
      const recentAttempts = attempts.filter((attempt) => attempt > cutoff);
      if (recentAttempts.length) {
        this.messageAttempts.set(key, recentAttempts);
      } else {
        this.messageAttempts.delete(key);
      }
    }
    this.lastRateLimitCleanupAt = now;
  }

  private emitError(
    client: AuthenticatedSocket,
    error: unknown,
    context: { bookingId?: string; clientMessageId?: string },
  ) {
    const code = this.errorCode(error);
    const bookingId = this.safeErrorIdentifier(context.bookingId, 64);
    const clientMessageId = this.safeErrorIdentifier(
      context.clientMessageId,
      128,
    );
    const message =
      code === 'FORBIDDEN'
        ? 'You do not have access to this booking chat.'
        : code === 'BOOKING_NOT_FOUND'
          ? 'This booking chat is not available.'
          : code === 'VALIDATION_ERROR'
            ? error instanceof Error
              ? error.message
              : 'The message is invalid.'
            : code === 'RATE_LIMITED'
              ? 'Too many messages. Please wait a moment and try again.'
              : 'Could not send message. Please try again.';

    client.emit('sitterChat:error', {
      code,
      message,
      bookingId,
      clientMessageId,
    } satisfies SitterChatErrorDto);

    this.logger.warn(
      `Socket chat error ${code} for account ${client.data.accountId}${bookingId ? ` on booking ${bookingId}` : ''}`,
    );
  }

  private safeErrorIdentifier(value: unknown, maxLength: number) {
    return typeof value === 'string' &&
      value.length <= maxLength &&
      /^[a-zA-Z0-9._:-]+$/.test(value)
      ? value
      : undefined;
  }

  private errorCode(error: unknown): SitterChatErrorCode {
    if (error instanceof SitterChatRateLimitError) return 'RATE_LIMITED';
    if (error instanceof ForbiddenException) return 'FORBIDDEN';
    if (error instanceof NotFoundException) return 'BOOKING_NOT_FOUND';
    if (error instanceof BadRequestException) return 'VALIDATION_ERROR';
    if (error instanceof HttpException) return 'MESSAGE_SEND_FAILED';
    return 'MESSAGE_SEND_FAILED';
  }

  private roomName(bookingId: string) {
    return `sitter-booking:${bookingId}`;
  }
}

class SitterChatRateLimitError extends Error {}
