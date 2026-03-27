import { IBudgetTransaction } from "@/interfaces";
import { date } from "./dayjsConfig";

export interface IBudgetTransactionSection {
  date: string; // formatted date label e.g. "March 23, 2026"
  data: IBudgetTransaction[];
  totalAmount: number;
}

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
      data: items,
      totalAmount: items.reduce((sum, t) => sum + parseFloat(t.amount), 0),
    }))
    .sort((a, b) => date(b.date).valueOf() - date(a.date).valueOf()); // newest first
};
