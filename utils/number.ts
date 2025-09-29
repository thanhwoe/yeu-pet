export function abbreviateNumber(num: number, decimals: number = 1): string {
  if (num < 10000) {
    return num.toLocaleString();
  }

  const units = [
    { value: 1e9, suffix: "B" }, // Billion
    { value: 1e6, suffix: "M" }, // Million
    { value: 1e3, suffix: "K" }, // Thousand
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(decimals);
      // Remove trailing zeros and decimal point if not needed
      const cleaned = parseFloat(formatted).toString();
      return cleaned + unit.suffix;
    }
  }

  return num.toString();
}
