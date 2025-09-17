// helpers/mappers.ts
import {
    ClientApi, ExpenseApi, PaymentApi, DebtRecordApi,
    ProductApi, StockEntryApi, SaleApi, MonthlyProfitApi
} from '../types/api-types';
import {
    Client, Expense, Payment, DebtRecord, Product, StockEntry, Sale, MonthlyProfit, ExpenseCategory
} from '../types/app-types';

const monthString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;

// Backend category:number -> label:ExpenseCategory
// mappingni kelishib oling (0..5)
const expenseCategoryFromNumber = (n: number): ExpenseCategory => {
    switch (n) {
        case 1: return 'rent';
        case 2: return 'internet';
        case 3: return 'electricity';
        case 4: return 'tax';
        case 5: return 'salary';
        case 6: return 'personal';
        default: return 'personal';
    }
};

export const expenseCategoryToNumber = (c: ExpenseCategory): number => {
    switch (c) {
        case 'rent':        return 1;
        case 'internet':    return 2;
        case 'electricity': return 3;
        case 'tax':         return 4;
        case 'salary':      return 5;
        case 'personal':    return 6;
    }
};

export const toExpensePayload = (e: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: string; // 'YYYY-MM-DD'
}) => ({
    category: expenseCategoryToNumber(e.category),
    amount: e.amount,
    description: e.description || null,
    date: e.date,
});

export const toClient = (c: ClientApi): Client => ({
    id: c.id,
    name: c.name,
    phone: c.telephone,
    telegram: c.telegram ?? undefined,
    createdAt: new Date(c.created_at),
    lastPayment: c.last_payment ? new Date(c.last_payment) : undefined,
    totalDebt: Number(c.total_debt ?? 0),
    paidAmount: Number(c.paid_amount ?? 0),
});

export const toExpense = (e: ExpenseApi): Expense => {
    const date = new Date(e.date);
    return {
        id: e.id,
        category: expenseCategoryFromNumber(e.category),
        amount: Number(e.amount),
        description: e.description ?? '',
        date,
        month: monthString(date),
    };
};

export const toPayment = (p: PaymentApi): Payment => ({
    id: p.id,
    clientId: p.client_id,
    amount: Number(p.amount),
    description: p.description ?? undefined,
    date: new Date(p.created_at), // API’da date yo‘q — created_at
});

export const toDebtRecord = (d: DebtRecordApi): DebtRecord => {
    const date = new Date(d.created_at);
    return {
        id: d.id,
        clientId: d.client_id,
        amount: Number(d.amount),
        description: d.description ?? undefined,
        date,
        month: monthString(date),
        // type backendda yo‘q, istasangiz qo‘shib yuborasiz (masalan descriptionga qarab)
    };
};

export const toProduct = (p: ProductApi): Product => ({
    id: p.id,
    name: p.name,
    category: p.category,
    purchasePrice: Number(p.purchase_price),
    salePrice: Number(p.sale_price),
    stockQuantity: p.stock_quantity,
    minQuantity: p.min_quantity,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
});

export const toStockEntry = (s: StockEntryApi): StockEntry => {
    const date = new Date(s.created_at);
    return {
        id: s.id,
        productId: s.product_id,
        quantity: s.quantity,
        purchasePrice: Number(s.unit_price),
        totalCost: s.quantity * Number(s.unit_price),
        date,
        description: s.description ?? undefined,
    };
};

export const toSale = (s: SaleApi): Sale => {
    const date = new Date(s.created_at);
    return {
        id: s.id,
        productId: s.product_id,
        quantity: s.quantity,
        salePrice: Number(s.unit_price),
        totalAmount: s.quantity * Number(s.unit_price),
        date,
        description: s.description ?? undefined,
    };
};

export const toMonthlyProfit = (m: MonthlyProfitApi): MonthlyProfit => ({
    id: m.id,
    month: String(m.month).padStart(2, '0'),
    totalRevenue: Number(m.total_revenue),
    totalExpenses: Number(m.total_expenses),
    totalDebtsAdded: Number(m.total_debts_added),
    debtPayments: Number(m.debt_payments),
    productProfit: m.product_profit ?? 0,
    netProfit: Number(m.net_profit),
    createdAt: new Date(m.created_at),
});
