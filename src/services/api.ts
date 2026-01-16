const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__API__URL__) ||
    import.meta.env.VITE_API_URL || 'https://apidev.pcbuild.uz/api';

class ApiService {
  private token: string | null = null;
  private readonly TOKEN_KEY = 'auth_token';

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(this.TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      else localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      body: options.body,
      // CORS uchun backend’da Authorization ruxsat etilgan bo‘lishi kerak
      mode: 'cors',
      cache: 'no-store',
    };

    try {
      const res = await fetch(url, config);

      // JSON bo‘lmasa ham xotirjam bo‘laylik
      const maybeJson = async () => {
        try { return await res.json(); } catch { return null; }
      };

      if (!res.ok) {
        const data = await maybeJson();
        const msg =
            data?.message ||
            data?.error ||
            (data?.errors ? JSON.stringify(data.errors) : null) ||
            `HTTP error (${res.status})`;

        // 401 – token invalid/expired: bu yerda refresh oqimini qo‘shishingiz mumkin.
        // Hozircha soddaroq: xatoni tashlaymiz va UI login sahifasiga yo‘naltiradi.
        throw new Error(msg);
      }

      return (await maybeJson()) ?? {};
    } catch (err: any) {
      // Network-level
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new Error("Backend server bilan bog'lanib bo'lmadi. Server ishga tushirilganini tekshiring.");
      }
      throw err;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, { cache: 'no-store' });
      return await response.json();
    } catch (error) {
      throw new Error('Backend server ishlamayapti');
    }
  }

  // Auth methods
  async login(telegram: string, password: string) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ telegram, password }),
    });

    if (response?.token) this.setToken(response.token);
    
    return response;
  }

  async refresh() {
    const res = await this.request('/refresh', { method: 'POST' }); // { user, token, message }
    if (res?.token) this.setToken(res.token);
    return res;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  // Client methods
  async getClients() {
    return this.request('/clients');
  }

  async getDashboard() {
    return this.request('/dashboard/statistic');
  }

  async getLassProducts() {
    return this.request('/dashboard/lass-products');
  }

  async createClient(client: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: number, client: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: number) {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  // Recent Expense methods
  async getRecentExpenses(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/dashboard/recent-expenses${params}`);
  }

  // Expense methods
  async getExpenses(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/expenses${params}`);
  }

  async createExpense(expense: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id: number, expense: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id: number) {
    return this.request(`/expenses/${id}`, { method: 'DELETE' });
  }

  // Payment methods
  async getPayments(clientId?: string, month?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (month) params.append('month', month);
    const queryString = params.toString();
    return this.request(`/payments${queryString ? `?${queryString}` : ''}`);
  }

  // Recent Payment methods
  async getRecentPayments(month?: string) {
    const params = new URLSearchParams();
    if (month && month !== 'all') params.append('month', month);
    const queryString = params.toString();
    return this.request(`/dashboard/recent-payments${queryString ? `?${queryString}` : ''}`);
  }

  async createPayment(payment: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async deletePayment(id: number) {
    return this.request(`/payments/${id}`, { method: 'DELETE' });
  }

  // Debt methods
  async getDebtRecords(clientId?: string, month?: string, type?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (month) params.append('month', month);
    if (type) params.append('type', type);
    const queryString = params.toString();
    return this.request(`/debts${queryString ? `?${queryString}` : ''}`);
  }

  async createDebtRecord(debt: any) {
    return this.request('/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    });
  }

  async deleteDebtRecord(id: number) {
    return this.request(`/debts/${id}`, { method: 'DELETE' });
  }

  // Product methods
  async getProducts(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/products${params}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async addStock(productId: number, stock: { quantity: number; unit_price: number; description?: string | null }) {
    return this.request(`/products/${productId}/stock`, {
      method: 'POST',
      body: JSON.stringify(stock),
    });
  }

  async recordSale(productId: number, sale: { quantity: number; unit_price: number; description?: string | null }) {
    return this.request(`/products/${productId}/sale`, {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  // Profit methods
  async getMonthlyProfits(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/profits${params}`);
  }

  async createMonthlyProfit(profit: any) {
    return this.request('/profits', {
      method: 'POST',
      body: JSON.stringify(profit),
    });
  }

  async updateMonthlyProfit(id: number, profit: any) {
    return this.request(`/profits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profit),
    });
  }

  async deleteMonthlyProfit(id: number) {
    return this.request(`/profits/${id}`, { method: 'DELETE' });
  }

  async getProductStockEntries(id: number) {
    let res = this.request(`/products/${id}/stock-entries`);
    console.log(res);
    return res;
  }

  async getProductSales(id: number) {
    let res = this.request(`/products/${id}/sales`);
    console.log(res);
    return res;
  }

  // Oylik statistika
  async getMonthlyStatistics(month?: string) {
    const params = month && month !== 'all' ? `?month=${month}` : '';
    return this.request(`/statistics/monthly${params}`);
  }

  // Mijoz tarixi (statistika bilan)
  async getClientHistory(clientId: number, month?: string) {
    const params = month && month !== 'all' ? `?month=${month}` : '';
    return this.request(`/clients/${clientId}/history${params}`);
  }
}

export const apiService = new ApiService();
