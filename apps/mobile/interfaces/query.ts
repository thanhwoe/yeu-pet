import "@tanstack/react-query";

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errors?: {
    message: string;
    field?: string;
  }[];
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ErrorResponse;
  }
}
