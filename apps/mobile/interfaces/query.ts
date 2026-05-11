import "@tanstack/react-query";

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ErrorResponse;
  }
}
