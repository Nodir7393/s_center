export interface Client {
  id: string;
  name: string;
  phone: string;
  telegram?: string;
  totalDebt: number;
  paidAmount: number;
  createdAt: Date;
  lastPayment?: Date;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  month: string;
}

export type ExpenseCategory = 'rent' | 'internet' | 'electricity' | 'tax' | 'salary' | 'personal';

export interface MonthlyExpenses {
  rent: number;
  internet: number;
  electricity: number;
  tax: number;
  salary: number;
  personal: number;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  description?: string;
}

export interface DebtRecord {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  description?: string;
  type: 'initial' | 'additional';
  month: string;
}

export interface MonthlyProfit {
  id: string;
  month: string;
  totalRevenue: number;
  totalExpenses: number;
  totalDebtsAdded: number;
  debtPayments: number;
  productProfit?: number;
  netProfit: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  minQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
  date: Date;
  description?: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  salePrice: number;
  totalAmount: number;
  date: Date;
  description?: string;
}