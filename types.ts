export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  created_at?: string;
}

export interface TransactionCreate {
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  todayExpense: number;
}
