import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, CreditCard, Package, PieChart, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Client, Expense, Payment, DebtRecord, Product } from '../types/app-types';
import type {Dashboard} from '../types/app-types';
import { apiService } from '../services/api';
import { formatCurrency, getMonthName } from '../utils/calculations';
import {toClient, toDebtRecord, toExpense, toPayment, toProduct} from "../helpers/mappers";
import { asArray } from '../helpers/http';

const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>();
  const [lassProducts, setLassProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getMonthOptions = () => {
    const months = [{ value: 'all', label: 'Hamma vaqt' }];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ value: monthString, label: getMonthName(monthString) });
    }
    return months;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        clientsApi, expensesApi, paymentsApi, debtApi, dashboardApi, lassProductsApi
      ] = await Promise.all([
        apiService.getClients(),
        apiService.getExpenses(),        // ?month param bermasangiz ham mayli
        apiService.getPayments(),
        apiService.getDebtRecords(),
        apiService.getDashboard(),
        apiService.getLassProducts()
      ]);

      setDashboard(dashboardApi.data);
      setLassProducts(asArray(lassProductsApi.data).map(toProduct));
      setClients(asArray(clientsApi).map(toClient));
      setExpenses(asArray(expensesApi).map(toExpense));
      setPayments(asArray(paymentsApi).map(toPayment));
      setDebtRecords(asArray(debtApi).map(toDebtRecord));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // const currentMonth = getCurrentMonth();
  const monthOptions = getMonthOptions();
  
  // Calculate statistics based on selected month
  const getFilteredData = () => {
    if (selectedMonth === 'all') {
      return {
        expenses: expenses,
        payments: payments,
        debtRecords: debtRecords
      };
    }

    const getMonthString = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const filteredExpenses = expenses.filter(e => getMonthString(e.date) === selectedMonth);
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      return paymentMonth === selectedMonth;
    });
    const filteredDebtRecords = debtRecords.filter(r => getMonthString(r.date) === selectedMonth);
    
    return {
      expenses: filteredExpenses,
      payments: filteredPayments,
      debtRecords: filteredDebtRecords
    };
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
              </span>
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                    Vaqt oralig'ini tanlang
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {monthOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedMonth(option.value);
                          setShowDatePicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                          selectedMonth === option.value
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Info */}
      {selectedMonth !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <p className="text-blue-800 text-sm">
              <span className="font-medium">{getMonthName(selectedMonth)}</span> oyi uchun ma'lumotlar ko'rsatilmoqda
            </p>
            <button
              onClick={() => setSelectedMonth('all')}
              className="text-blue-600 hover:text-blue-800 text-sm underline ml-auto"
            >
              Barchasini ko'rish
            </button>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lassProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800 font-medium">Kam qolgan mahsulotlar</h3>
          </div>
          <div className="space-y-1">
            {lassProducts.slice(0, 3).map(product => (
              <p key={product.id} className="text-red-700 text-sm">
                • {product.name} - {product.stockQuantity} ta qoldi (minimal: {product.minQuantity})
              </p>
            ))}
            {lassProducts.length > 3 && (
              <p className="text-red-700 text-sm">
                ... va yana {lassProducts.length - 3} ta mahsulot
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami Mijozlar</p>
              <p className="text-3xl font-bold text-purple-600">{dashboard?.count_client}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ro'yxatdan o'tgan mijozlar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami Qarzlar</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboard?.total_debt)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            To'lanmagan qarzlar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth === 'all' ? 'Jami Daromad' : 'Oylik Daromad'}
              </p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboard?.total_revenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth === 'all' ? 'Jami Xarajat' : 'Oylik Xarajat'}
              </p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(dashboard?.total_expense)}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
          </p>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami Mahsulotlar</p>
              <p className="text-2xl font-bold text-blue-600">{dashboard?.count_products}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ro'yxatdagi mahsulotlar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kam Qolgan</p>
              <p className="text-2xl font-bold text-red-600">{dashboard?.less_product}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Minimal miqdordan kam
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth === 'all' ? 'Jami Foyda' : 'Oylik Foyda'}
              </p>
              <p className={`text-2xl font-bold ${
                (dashboard?.all_benefit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(dashboard?.all_benefit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              (dashboard?.all_benefit ?? 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <PieChart className={`w-6 h-6 ${
                (dashboard?.all_benefit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMonth === 'all' ? 'So\'nggi To\'lovlar' : `${getMonthName(selectedMonth)} To'lovlari`}
          </h2>
          <div className="space-y-3">
            {filteredData.payments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((payment) => {
                const client = clients.find(c => c.id === payment.clientId);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{client?.name || 'Noma\'lum mijoz'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                  </div>
                );
              })}
            {filteredData.payments.length === 0 && (
              <p className="text-gray-500 text-center py-4">To'lovlar mavjud emas</p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMonth === 'all' ? 'So\'nggi Xarajatlar' : `${getMonthName(selectedMonth)} Xarajatlari`}
          </h2>
          <div className="space-y-3">
            {filteredData.expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {expense.category} • {new Date(expense.date).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  <p className="font-medium text-red-600">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            {filteredData.expenses.length === 0 && (
              <p className="text-gray-500 text-center py-4">Xarajatlar mavjud emas</p>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close date picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;