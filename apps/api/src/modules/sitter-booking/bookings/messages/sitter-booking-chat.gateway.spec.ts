import { ForbiddenException } from '@nestjs/common';
import {
  AuthenticatedSocket,
  SitterBookingChatGateway,
  SitterChatNamespace,
} from './sitter-booking-chat.gateway';
import type { SitterChatErrorDto } from './sitter-booking-chat.types';

const BOOKING_ID = '6d7ad19a-154d-4d70-9938-078737b76195';

describe('SitterBookingChatGateway', () => {
  const jwtService = { verifyAsync: jest.fn() };
  const usersService = { findById: jest.fn() };
  const messagesService = {
    assertBookingParticipant: jest.fn(),
    createMessage: jest.fn(),
  };
  let gateway: SitterBookingChatGateway;

  type SocketMiddleware = Parameters<SitterChatNamespace['use']>[0];

  const captureSocketMiddleware = () => {
    let middleware: SocketMiddleware | undefined;
    const server = {
      use(handler: SocketMiddleware) {
        middleware = handler;
        return this;
      },
    };
    gateway.afterInit(server as unknown as SitterChatNamespace);
    if (!middleware) throw new Error('Socket middleware was not registered');
    return middleware;
  };

  const invokeSocketMiddleware = (
    middleware: SocketMiddleware,
    socket: unknown,
  ) =>
    new Promise<Error | undefined>((resolve) => {
      middleware(socket as AuthenticatedSocket, (error) => resolve(error));
    });

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new SitterBookingChatGateway(
      jwtService as never,
      usersService as never,
      messagesService as never,
    );
  });

  it('rejects a connection without a token', async () => {
    const middleware = captureSocketMiddleware();
    const error = (await invokeSocketMiddleware(middleware, {
      handshake: { auth: {} },
      data: {},
    })) as Error & { data?: SitterChatErrorDto };

    expect(error.data?.code).toBe('UNAUTHORIZED');
  });

  it('authenticates an active account from socket auth', async () => {
    const middleware = captureSocketMiddleware();
    jwtService.verifyAsync.mockResolvedValue({ sub: 'account-1' });
    usersService.findById.mockResolvedValue({
      id: 'account-1',
      is_active: true,
    });
    const socket: {
      handshake: { auth: { token: string } };
      data: { accountId?: string };
    } = { handshake: { auth: { token: 'jwt' } }, data: {} };

    const error = await invokeSocketMiddleware(middleware, socket);

    expect(error).toBeUndefined();
    expect(socket.data.accountId).toBe('account-1');
  });

  it('rejects an invalid token', async () => {
    const middleware = captureSocketMiddleware();
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const error = (await invokeSocketMiddleware(middleware, {
      handshake: { auth: { token: 'invalid' } },
      data: {},
    })) as Error & { data?: SitterChatErrorDto };

    expect(error.data?.code).toBe('UNAUTHORIZED');
  });

  it('joins only after participant validation', async () => {
    messagesService.assertBookingParticipant.mockResolvedValue({});
    const client = {
      data: { accountId: 'account-1' },
      join: jest.fn(),
      emit: jest.fn(),
    };

    await gateway.join(client as never, { bookingId: BOOKING_ID });

    expect(messagesService.assertBookingParticipant).toHaveBeenCalledWith({
      bookingId: BOOKING_ID,
      accountId: 'account-1',
    });
    expect(client.join).toHaveBeenCalledWith(`sitter-booking:${BOOKING_ID}`);
    expect(client.emit).toHaveBeenCalledWith('sitterChat:joined', {
      bookingId: BOOKING_ID,
      room: `sitter-booking:${BOOKING_ID}`,
    });
  });

  it('emits a forbidden error for a non-participant', async () => {
    messagesService.assertBookingParticipant.mockRejectedValue(
      new ForbiddenException(),
    );
    const client = {
      data: { accountId: 'account-1' },
      join: jest.fn(),
      emit: jest.fn(),
    };

    await gateway.join(client as never, { bookingId: BOOKING_ID });

    expect(client.join).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(
      'sitterChat:error',
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });

  it('persists before broadcasting and acknowledging a message', async () => {
    const message = { id: 'message-1', bookingId: BOOKING_ID };
    messagesService.assertBookingParticipant.mockResolvedValue({});
    messagesService.createMessage.mockResolvedValue(message);
    const emitToRoom = jest.fn();
    Object.assign(gateway, {
      server: { to: jest.fn(() => ({ emit: emitToRoom })) },
    });
    const client = {
      data: { accountId: 'account-1' },
      emit: jest.fn(),
    };

    await gateway.sendMessage(client as never, {
      bookingId: BOOKING_ID,
      clientMessageId: 'client-1',
      content: 'Hello',
    });

    expect(messagesService.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'websocket' }),
    );
    expect(emitToRoom).toHaveBeenCalledWith('sitterChat:newMessage', {
      message,
    });
    expect(client.emit).toHaveBeenCalledWith('sitterChat:messageAck', {
      bookingId: BOOKING_ID,
      clientMessageId: 'client-1',
      message,
    });
  });

  it('rejects empty content before checking booking permissions', async () => {
    const client = {
      data: { accountId: 'account-1' },
      emit: jest.fn(),
    };

    await gateway.sendMessage(client as never, {
      bookingId: BOOKING_ID,
      clientMessageId: 'client-empty',
      content: '   ',
    });

    expect(messagesService.assertBookingParticipant).not.toHaveBeenCalled();
    expect(messagesService.createMessage).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(
      'sitterChat:error',
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        clientMessageId: 'client-empty',
      }),
    );
  });

  it('limits a participant to 20 messages per minute per booking', async () => {
    messagesService.assertBookingParticipant.mockResolvedValue({});
    messagesService.createMessage.mockResolvedValue({
      id: 'message-1',
      bookingId: BOOKING_ID,
    });
    Object.assign(gateway, {
      server: { to: jest.fn(() => ({ emit: jest.fn() })) },
    });
    const client = {
      data: { accountId: 'account-1' },
      emit: jest.fn(),
    };

    for (let index = 0; index < 21; index += 1) {
      await gateway.sendMessage(client as never, {
        bookingId: BOOKING_ID,
        clientMessageId: `client-${index}`,
        content: 'Hello',
      });
    }

    expect(messagesService.createMessage).toHaveBeenCalledTimes(20);
    expect(client.emit).toHaveBeenLastCalledWith(
      'sitterChat:error',
      expect.objectContaining({ code: 'RATE_LIMITED' }),
    );
  });
});
