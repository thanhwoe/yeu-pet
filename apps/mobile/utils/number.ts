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

export function calculateDiscountPercentage(
  originalPrice?: number,
  salePrice?: number,
) {
  if (!originalPrice) {
    return "0%";
  }

  const difference = originalPrice - (salePrice ?? 0);
  const percentageDiff = (difference / originalPrice) * 100;

  return `-${percentageDiff.toFixed(0)}%`;
}

const abbreviateCurrency = (value: number, locale = "en-US"): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `${sign}${absValue.toLocaleString(locale)}`;
};

export const formatCurrency = (
  value: number,
  symbol = "$",
  locale = "en-US",
): string => {
  return `${symbol}${abbreviateCurrency(value, locale)}`;
};

// formatCurrency(1_500_000)      // "$1.5M"
// formatCurrency(48000, '₫')    // "₫48K"
// formatCurrency(48000, '€')

export const shortID = (id: string, maxLength = 10) => {
  if (id.length <= maxLength) {
    return id;
  }
  return id.slice(0, 5) + "..." + id.slice(-5);
};
