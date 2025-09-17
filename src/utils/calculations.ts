import { Client, Expense, Payment, DebtRecord, Product, Sale } from '../types/app-types';

// --- Helpers ---
const mmFromDate = (d: Date | string) => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return String(dt.getMonth() + 1).padStart(2, '0'); // "MM"
};

const mmFromValue = (value: string) => {
  // value: "YYYY-MM" yoki "MM"
  const mm = value.includes('-') ? value.split('-')[1] : value;
  return String(parseInt(mm, 10)).padStart(2, '0');
};

export const formatCurrency = (amount: number | undefined): string => {
  const safe = Number.isFinite(amount as number) ? (amount as number) : 0;
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(safe);
};

export const calculateTotalDebt = (clients: Client[]): number => clients.reduce((total, c) => total + (c.totalDebt - c.paidAmount), 0);

export const calculateTotalExpenses = (expenses: Expense[], month?: string): number => {
  const targetMM = month ? mmFromValue(month) : null;
  const filtered = targetMM
      ? expenses.filter(e => mmFromValue(e.month) === targetMM)
      : expenses;
  return filtered.reduce((sum, e) => sum + e.amount, 0);
};

export const calculateTotalRevenue = (clients: Client[]): number => clients.reduce((sum, c) => sum + c.paidAmount, 0);

export const calculateProfit = (clients: Client[], expenses: Expense[], month?: string): number => {
  const revenue = calculateTotalRevenue(clients);
  const totalExpenses = calculateTotalExpenses(expenses, month);
  return revenue - totalExpenses;
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentMonthMM = () => String(new Date().getMonth() + 1).padStart(2, '0');

export const getMonthNameFromMM = (mm: string) => {
  const month = parseInt(mm, 10) - 1;
  return new Date(2000, month, 1).toLocaleDateString('uz-UZ', { month: 'long' });
};
export const getMonthName = (value: string) => {
  const mm = value.includes('-') ? value.split('-')[1] : value;
  const m = parseInt(mm, 10) - 1;
  return new Date(2000, m, 1).toLocaleDateString('uz-UZ', { month: 'long' });
};

export const calculateMonthlyDebtsAdded = (debtRecords: DebtRecord[], month: string): number => {
  const targetMM = mmFromValue(month);
  return debtRecords
    .filter(r => mmFromValue(r.month) === targetMM)
    .reduce((sum, r) => sum + r.amount, 0);
};

export const calculateMonthlyPayments = (payments: Payment[], month: string): number => {
  const targetMM = mmFromValue(month);
  return payments
    .filter(p => mmFromDate(p.date) === targetMM)
    .reduce((sum, p) => sum + p.amount, 0);
};

export const calculateNetProfit = (revenue: number, expenses: number, debtsAdded: number, debtPayments: number = 0, productProfit: number = 0): number => {
  return revenue - debtsAdded - expenses + debtPayments + productProfit;
};

export const calculateMonthlyStats = (
  month: string,
  expenses: Expense[],
  debtRecords: DebtRecord[],
  payments: Payment[],
  products: Product[],
  sales: Sale[]
) => {
  const targetMM = mmFromValue(month);

  const totalExpenses = calculateTotalExpenses(expenses, targetMM);
  const totalDebtsAdded = calculateMonthlyDebtsAdded(debtRecords, targetMM);
  const debtPayments = calculateMonthlyPayments(payments, targetMM);

  // Mahsulot foydasi (faqat shu oyda bo‘lgan sotuvlar)
  const productProfit = sales
      .filter(sale => mmFromDate(sale.date) === targetMM)
      .reduce((sum, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (!product) return sum;
        const revenue = sale.quantity * sale.salePrice;
        const cost = sale.quantity * product.purchasePrice;
        return sum + (revenue - cost);
      }, 0);

  // “totalRevenue” sifatida hozircha debtPayments’ni ishlatyapsiz (shu loyihangizda shunday qilingan).
  const totalRevenue = debtPayments;

  return {
    totalRevenue,
    totalExpenses,
    totalDebtsAdded,
    debtPayments,
    productProfit,
  };
};