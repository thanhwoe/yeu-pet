interface RedirectSystemPathParams {
  path: string;
  initial: boolean;
}

export function redirectSystemPath({
  path,
  initial,
}: RedirectSystemPathParams) {
  try {
    if (initial) {
      return path;
    }

    if (path.includes("/payment-return")) {
      return null;
    }

    return path;
  } catch {
    return "/not-found";
  }
}
