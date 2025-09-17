// Xom API javoblari (Laravel Eloquent -> JSON)
export interface ClientApi {
    id: number;
    name: string;
    telephone: string;
    telegram: string | null;
    // Quyidagilar bo'lishi ham mumkin (agar backend qaytarsa)
    total_debt?: number;
    paid_amount?: number;
    last_payment?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExpenseApi {
    id: number;
    category: number;          // DB: unsignedTinyInteger
    amount: number;
    description: string | null;
    date: string;              // 'YYYY-MM-DD'
    created_at?: string;
    updated_at?: string;
}

export interface PaymentApi {
    id: number;
    client_id: number;
    amount: number;
    description: string | null;
    created_at: string;        // date/time yo‘q bo‘lsa created_at dan foydalanamiz
    updated_at: string;
}

export interface DebtRecordApi {
    id: number;
    client_id: number;
    amount: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductApi {
    id: number;
    name: string;
    category: number;          // DB: unsignedTinyInteger
    purchase_price: number;
    sale_price: number;
    stock_quantity: number;
    min_quantity: number;
    created_at: string;
    updated_at: string;
}

export interface StockEntryApi {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface SaleApi {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface MonthlyProfitApi {
    id: number;
    month: number; // masalan 202509 yoki 2025-09 ni int sifatida saqlayapsiz
    total_revenue: number;
    total_expenses: number;
    total_debts_added: number;
    debt_payments: number;
    product_profit: number | null;
    net_profit: number;
    created_at: string;
    updated_at: string;
}
