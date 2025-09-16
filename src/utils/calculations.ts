import { Client, Expense, Payment, DebtRecord, MonthlyProfit } from '../types';

export const formatCurrency = (amount: number | undefined): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(amount);
};

export const calculateTotalDebt = (clients: Client[]): number => {
  return clients.reduce((total, client) => total + (client.totalDebt - client.paidAmount), 0);
};

export const calculateTotalExpenses = (expenses: Expense[], month?: string): number => {
  const filteredExpenses = month 
    ? expenses.filter(expense => expense.month === month)
    : expenses;
  return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateTotalRevenue = (clients: Client[]): number => {
  return clients.reduce((total, client) => total + client.paidAmount, 0);
};

export const calculateProfit = (clients: Client[], expenses: Expense[], month?: string): number => {
  const revenue = calculateTotalRevenue(clients);
  const totalExpenses = calculateTotalExpenses(expenses, month);
  return revenue - totalExpenses;
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
};

export const calculateMonthlyDebtsAdded = (debtRecords: DebtRecord[], month: string): number => {
  return debtRecords
    .filter(record => record.month === month)
    .reduce((total, record) => total + record.amount, 0);
};

export const calculateMonthlyPayments = (payments: Payment[], month: string): number => {
  return payments
    .filter(payment => {
      const paymentDate = new Date(payment.date);
      const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      return paymentMonth === month;
    })
    .reduce((total, payment) => total + payment.amount, 0);
};

export const calculateNetProfit = (revenue: number, expenses: number, debtsAdded: number, debtPayments: number = 0, productProfit: number = 0): number => {
  return revenue - debtsAdded - expenses + debtPayments + productProfit;
};

export const calculateMonthlyStats = (
  month: string,
  expenses: Expense[],
  debtRecords: DebtRecord[],
  payments: Payment[],
  products: any[],
  sales: any[]
) => {
  const totalExpenses = calculateTotalExpenses(expenses, month);
  const totalDebtsAdded = calculateMonthlyDebtsAdded(debtRecords, month);
  const debtPayments = calculateMonthlyPayments(payments, month);
  
  // Calculate product profit for the month
  const monthlyProductProfit = products.reduce((total, product) => {
    const productSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      return saleMonth === month && sale.productId === product.id;
    });
    
    const productRevenue = productSales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    const productCost = productSales.reduce((sum, sale) => sum + (sale.quantity * product.costPrice), 0);
    
    return total + (productRevenue - productCost);
  }, 0);
  
  // Calculate total revenue from debt payments
  const totalRevenue = debtPayments;
  
  return {
    totalRevenue,
    totalExpenses,
    totalDebtsAdded,
    debtPayments,
    productProfit: monthlyProductProfit
  };
};