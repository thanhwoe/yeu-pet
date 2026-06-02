import { useEffect, useRef, useState } from "react";
import { Markdown } from "../Markdown";
import { Text } from "../ui/Text";

interface TypingMessageProps {
  value: string;
  speed?: number;
  onComplete?: () => void;
  isTyping?: boolean;
}
export const TypingMessage = ({
  value,
  speed = 30,
  onComplete,
  isTyping = true,
}: TypingMessageProps) => {
  const [display, setDisplay] = useState(isTyping ? "" : value);
  const [isCompleted, setIsCompleted] = useState(!isTyping);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isTyping) {
      setDisplay(value);
      setIsCompleted(true);
      return;
    }

    setDisplay("");
    setIsCompleted(false);
    indexRef.current = 0;
    const typeText = () => {
      if (indexRef.current < value.length) {
        setDisplay(value.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        const delay = 1000 / speed;
        timeoutRef.current = setTimeout(typeText, delay);
      } else {
        setIsCompleted(true);
        onComplete?.();
      }
    };

    timeoutRef.current = setTimeout(typeText, 100);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, value, speed, onComplete]);

  if (!isCompleted) {
    return <Text>{display}</Text>;
  }
  return <Markdown>{value}</Markdown>;
};
