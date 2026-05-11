import { useEffect, useState } from "react";

export const useDebounce = (
  value: string,
  delay = 500,
  callback?: (value: string) => void
) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounceValue(value);
      value && callback?.(value);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, value]);

  return debounceValue;
};
