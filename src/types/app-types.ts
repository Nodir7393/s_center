// UI model — React uchun qulay (camelCase + Date)
export interface Client {
    id: number;
    name: string;
    phone: string;               // <- telephone dan
    telegram?: string;
    totalDebt: number;
    paidAmount: number;
    createdAt: Date;
    lastPayment?: Date;
}

export interface Dashboard {
    count_client: number;
    total_debt: number;
    total_revenue: number;
    total_expense: number;
    less_product: number;
    count_products: number;
    all_benefit: number;
}

export interface LassProduct {
    id: number;
    category: number;
    purchase_price: number;
    sale_price: number;
    stock_quantity: number;
    min_quantity: number;
    created_at: Date;
    updated_at: Date;
}

export type ExpenseCategory =
    | 'rent' | 'internet' | 'electricity' | 'tax' | 'salary' | 'personal';

export interface Expense {
    id: number;
    category: ExpenseCategory;   // <- number -> label
    amount: number;
    description: string;
    date: Date;
    month: string;               // 'YYYY-MM' (frontda hisoblanadi)
}

export interface MonthlyExpenses {
    rent: number; internet: number; electricity: number;
    tax: number; salary: number; personal: number;
}

export interface Payment {
    id: number;
    clientId: number;
    amount: number;
    date: Date;                  // created_at dan
    description?: string;
}

export interface DebtRecord {
    id: number;
    clientId: number;
    amount: number;
    date: Date;                  // created_at dan
    description?: string;
    month: string;               // 'YYYY-MM' (frontda hisoblanadi)
    // Backendda "type" yo‘q — shuning uchun ixtiyoriy qildik:
    type?: 'initial' | 'additional';
}

export interface MonthlyProfit {
    id: number;
    month: string;               // 'YYYY-MM' (int -> string)
    totalRevenue: number;
    totalExpenses: number;
    totalDebtsAdded: number;
    debtPayments: number;
    productProfit?: number;
    netProfit: number;
    createdAt: Date;
}

export interface Product {
    id: number;
    name: string;
    category: number;            // DB bilan mos. Agar label kerak bo‘lsa map qilamiz.
    purchasePrice: number;
    salePrice: number;
    stockQuantity: number;
    minQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface StockEntry {
    id: number;
    productId: number;
    quantity: number;
    purchasePrice: number;       // unit_price dan
    totalCost: number;
    date: Date;
    description?: string;
}

export interface Sale {
    id: number;
    productId: number;
    quantity: number;
    salePrice: number;           // unit_price dan
    totalAmount: number;
    date: Date;
    description?: string;
}
