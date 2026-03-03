import "@tanstack/react-query";

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    message: string;
    error: string;
    statusCode: number;
  };
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ErrorResponse;
  }
}
