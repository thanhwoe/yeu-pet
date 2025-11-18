export const isToday = (timestamp: string): boolean => {
  const today = new Date();
  const date = new Date(timestamp);

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};
