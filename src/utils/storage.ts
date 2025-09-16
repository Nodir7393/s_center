import { Client, Expense, Payment, DebtRecord, MonthlyProfit, Product, StockEntry, Sale } from '../types';

export const storage = {
  clients: {
    get: (): Client[] => {
      const data = localStorage.getItem('steam-center-clients');
      return data ? JSON.parse(data).map((client: any) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        lastPayment: client.lastPayment ? new Date(client.lastPayment) : undefined
      })) : [];
    },
    set: (clients: Client[]) => {
      localStorage.setItem('steam-center-clients', JSON.stringify(clients));
    }
  },
  expenses: {
    get: (): Expense[] => {
      const data = localStorage.getItem('steam-center-expenses');
      return data ? JSON.parse(data).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      })) : [];
    },
    set: (expenses: Expense[]) => {
      localStorage.setItem('steam-center-expenses', JSON.stringify(expenses));
    }
  },
  payments: {
    get: (): Payment[] => {
      const data = localStorage.getItem('steam-center-payments');
      return data ? JSON.parse(data).map((payment: any) => ({
        ...payment,
        date: new Date(payment.date)
      })) : [];
    },
    set: (payments: Payment[]) => {
      localStorage.setItem('steam-center-payments', JSON.stringify(payments));
    }
  },
  debtRecords: {
    get: (): DebtRecord[] => {
      const data = localStorage.getItem('steam-center-debt-records');
      return data ? JSON.parse(data).map((record: any) => ({
        ...record,
        date: new Date(record.date)
      })) : [];
    },
    set: (records: DebtRecord[]) => {
      localStorage.setItem('steam-center-debt-records', JSON.stringify(records));
    }
  },
  monthlyProfits: {
    get: (): MonthlyProfit[] => {
      const data = localStorage.getItem('steam-center-monthly-profits');
      return data ? JSON.parse(data).map((profit: any) => ({
        ...profit,
        debtPayments: profit.debtPayments || 0,
        productProfit: profit.productProfit || 0,
        createdAt: new Date(profit.createdAt)
      })) : [];
    },
    set: (profits: MonthlyProfit[]) => {
      localStorage.setItem('steam-center-monthly-profits', JSON.stringify(profits));
    }
  },
  products: {
    get: (): Product[] => {
      const data = localStorage.getItem('steam-center-products');
      return data ? JSON.parse(data).map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      })) : [];
    },
    set: (products: Product[]) => {
      localStorage.setItem('steam-center-products', JSON.stringify(products));
    }
  },
  stockEntries: {
    get: (): StockEntry[] => {
      const data = localStorage.getItem('steam-center-stock-entries');
      return data ? JSON.parse(data).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      })) : [];
    },
    set: (entries: StockEntry[]) => {
      localStorage.setItem('steam-center-stock-entries', JSON.stringify(entries));
    }
  },
  sales: {
    get: (): Sale[] => {
      const data = localStorage.getItem('steam-center-sales');
      return data ? JSON.parse(data).map((sale: any) => ({
        ...sale,
        date: new Date(sale.date)
      })) : [];
    },
    set: (sales: Sale[]) => {
      localStorage.setItem('steam-center-sales', JSON.stringify(sales));
    }
  }
};