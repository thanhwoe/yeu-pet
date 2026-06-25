import { IBudgetTransaction } from "@/interfaces";
import { date } from "./dayjsConfig";

export interface IBudgetTransactionSection {
  date: string; // formatted date label e.g. "21 tháng 6, 2026"
  dateKey: string; // stable YYYY-MM-DD key for sorting
  data: IBudgetTransaction[];
  totalAmount: number;
}

export const parseBudgetAmount = (
  value: string | number | null | undefined,
): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleanValue = value
    .trim()
    .replace(/[₫đ\s]/gi, "")
    .replace(/[^\d,.-]/g, "");

  if (
    !cleanValue ||
    cleanValue === "-" ||
    cleanValue === "." ||
    cleanValue === ","
  ) {
    return null;
  }

  const hasDot = cleanValue.includes(".");
  const hasComma = cleanValue.includes(",");
  let normalized = cleanValue;

  if (hasDot && hasComma) {
    normalized = cleanValue.replace(/\./g, "").replace(",", ".");
  } else if (hasDot) {
    const parts = cleanValue.split(".");
    const looksLikeThousands =
      parts.length > 2 ||
      (parts.length === 2 &&
        parts[1].length === 3 &&
        parts[0].replace("-", "").length <= 3);

    normalized = looksLikeThousands ? parts.join("") : cleanValue;
  } else if (hasComma) {
    const parts = cleanValue.split(",");
    const looksLikeThousands =
      parts.length > 2 ||
      (parts.length === 2 &&
        parts[1].length === 3 &&
        parts[0].replace("-", "").length <= 3);

    normalized = looksLikeThousands
      ? parts.join("")
      : cleanValue.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

export const formatBudgetCurrency = (
  value: string | number | null | undefined,
  options?: { expense?: boolean; fallback?: string },
): string => {
  const amount = parseBudgetAmount(value);

  if (amount === null) {
    return options?.fallback ?? "—";
  }

  const roundedAmount = Math.round(amount);
  const absoluteAmount = Math.abs(roundedAmount);
  const shouldShowNegative =
    absoluteAmount > 0 && (options?.expense || roundedAmount < 0);

  return `${shouldShowNegative ? "-" : ""}${absoluteAmount.toLocaleString(
    "vi-VN",
  )} ₫`;
};

export const groupBudgetTransactions = (
  transactions: IBudgetTransaction[],
): IBudgetTransactionSection[] => {
  const grouped = transactions.reduce<Record<string, IBudgetTransaction[]>>(
    (acc, transaction) => {
      const dateKey = date(transaction?.date).format("YYYY-MM-DD");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(transaction);
      return acc;
    },
    {},
  );

  return Object.entries(grouped)
    .map(([dateKey, items]) => ({
      date: date(dateKey).format("LL"), // "March 23, 2026"
      dateKey,
      data: items,
      totalAmount: items.reduce(
        (sum, transaction) =>
          sum + (parseBudgetAmount(transaction.amount) ?? 0),
        0,
      ),
    }))
    .sort((a, b) => date(b.dateKey).valueOf() - date(a.dateKey).valueOf()); // newest first
};
