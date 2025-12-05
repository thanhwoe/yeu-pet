import "@tanstack/react-query";

interface ErrorResponse {
  errors: {
    message: string;
    dev: string;
  }[];
  timestamp: string;
  path: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ErrorResponse;
  }
}
