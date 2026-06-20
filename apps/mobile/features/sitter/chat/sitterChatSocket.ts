import { ENV } from "@/constants/common";
import { io, Socket } from "socket.io-client";
import type {
  SitterChatClientEvents,
  SitterChatServerEvents,
} from "./sitterChat.types";

export type SitterChatSocket = Socket<
  SitterChatServerEvents,
  SitterChatClientEvents
>;

const socketOrigin = ENV.API_URL.replace(/\/api\/v\d+\/?$/, "");

export const createSitterChatSocket = (
  accessToken: string,
): SitterChatSocket =>
  io(`${socketOrigin}/sitter-bookings/chat`, {
    auth: { token: accessToken },
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
