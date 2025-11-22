export enum ToastVariants {
  DEFAULT = "default",
  ERROR = "error",
  SUCCESS = "success",
  WARNING = "warning",
}

export interface ToastProps {
  type: ToastVariants;
  text: string;
  title?: string;
  duration?: number;
}

export interface ToastRef {
  show: (params: ToastProps) => void;
}

export interface ToastRefObj {
  current: ToastRef | null;
}

export type ToastParams = Omit<ToastProps, "type">;

let refs: ToastRefObj[] = [];

/**
 * Adds a ref to the end of the array, which will be used to show the toasts until its ref becomes null.
 *
 * @param newRef the new ref, which must be stable for the life of the Toast instance.
 */
export const addNewRef = (newRef: ToastRef): void => {
  refs.push({
    current: newRef,
  });
};

/**
 * Removes the passed in ref from the file-level refs array using a strict equality check.
 *
 * @param oldRef the exact ref object to remove from the refs array.
 */
export const removeOldRef = (oldRef: ToastRef | null): void => {
  refs = refs.filter((r) => r.current !== oldRef);
};

export const getRef = (): ToastRef | null => {
  const reversePriority = [...refs].reverse();
  const activeRef = reversePriority.find((ref) => ref?.current !== null);

  if (!activeRef) {
    return null;
  }

  return activeRef.current;
};
