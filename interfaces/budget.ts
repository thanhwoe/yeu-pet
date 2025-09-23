export interface IBudgetTransaction {
  id: string;
  account_id: string;
  content: string;
  type: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface IBudget {
  id: string;
  account_id: string;
  monthly_budget: number;
  spent_balance: number;
  remaining_balance: number;
  created_at: string;
  updated_at: string;
}
