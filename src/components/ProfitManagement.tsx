import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Edit, Trash2, Filter, Calculator } from 'lucide-react';
import { MonthlyProfit, Client, Expense, DebtRecord, Payment, Product, Sale } from '../types/app-types';
import {toClient, toDebtRecord, toExpense, toMonthlyProfit, toPayment, toProduct} from '../helpers/mappers';
import { apiService } from '../services/api';
import { 
  formatCurrency, 
  getCurrentMonth, 
  getMonthName, 
  calculateNetProfit,
  calculateMonthlyStats,
  getCurrentMonthMM
} from '../utils/calculations';
import {asArray} from "../helpers/http.ts";

const ProfitManagement: React.FC = () => {
  const [monthlyProfits, setMonthlyProfits] = useState<MonthlyProfit[]>([]);
  const [, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfit, setEditingProfit] = useState<MonthlyProfit | null>(null);
  const [selectedMonth] = useState(getCurrentMonthMM());
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    month: getCurrentMonthMM(),  // "MM"
    totalRevenue: '',
    totalExpenses: '',
    totalDebtsAdded: '',
    debtPayments: '',
    productProfit: ''
  });

  const getMonthOptions = () => {
    const months: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, '0'); // <-- value faqat "MM"
      const label = `${d.getFullYear()} ${d.toLocaleDateString('uz-UZ', { month: 'long' })}`;
      months.push({ value: mm, label });                    // <-- label chiroyli, value "MM"
    }
    return months;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = (): void => {
    void loadDataFromAPI(); // “Promise returned is ignored” warning yo‘qoladi
  };

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      const [profitsData, clientsData, expensesData, debtRecordsData, paymentsData, productsData] = await Promise.all([
        apiService.getMonthlyProfits(selectedMonth === 'all' ? undefined : selectedMonth),
        apiService.getClients(),
        apiService.getExpenses(),
        apiService.getDebtRecords(),
        apiService.getPayments(),
        apiService.getProducts()
      ]);

      setMonthlyProfits(asArray(profitsData).map(toMonthlyProfit));
      setClients(asArray(clientsData).map(toClient));
      setExpenses(asArray(expensesData).map(toExpense));
      setDebtRecords(asArray(debtRecordsData).map(toDebtRecord));
      setPayments(asArray(paymentsData).map(toPayment));
      setProducts(asArray(productsData).map(toProduct));

      // Sales would need separate API endpoint
      setSales([]);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profit: MonthlyProfit) => {
    setEditingProfit(profit);
    setFormData({
      month: profit.month,
      totalRevenue: profit.totalRevenue.toString(),
      totalExpenses: profit.totalExpenses.toString(),
      totalDebtsAdded: profit.totalDebtsAdded.toString(),
      debtPayments: profit.debtPayments.toString(),
      productProfit: (profit.productProfit ?? 0).toString()
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProfit) {
        const netProfitToSend = calculateNetProfit(
            Number(formData.totalRevenue || 0),
            Number(formData.totalExpenses || 0),
            Number(formData.totalDebtsAdded || 0),
            Number(formData.debtPayments || 0),
            Number(formData.productProfit || 0)
        );

        await apiService.updateMonthlyProfit(editingProfit.id, {
          month: Number(formData.month),            // "07" -> 7
          total_revenue: Number(formData.totalRevenue),
          total_expenses: Number(formData.totalExpenses),
          total_debts_added: Number(formData.totalDebtsAdded),
          debt_payments: Number(formData.debtPayments),
          product_profit: Number(formData.productProfit || 0),
          net_profit: netProfitToSend,              // <-- MUHIM!
        });
        setEditingProfit(null);
      } else {
        const netProfitToSend = calculateNetProfit(
            Number(formData.totalRevenue || 0),
            Number(formData.totalExpenses || 0),
            Number(formData.totalDebtsAdded || 0),
            Number(formData.debtPayments || 0),
            Number(formData.productProfit || 0)
        );

        await apiService.createMonthlyProfit({
          month: Number(formData.month),                // "07" -> 7
          total_revenue: Number(formData.totalRevenue),
          total_expenses: Number(formData.totalExpenses),
          total_debts_added: Number(formData.totalDebtsAdded),
          debt_payments: Number(formData.debtPayments),
          product_profit: Number(formData.productProfit || 0),
          net_profit: netProfitToSend,
        });
      }
      
      setFormData({
        month: getCurrentMonthMM(),
        totalRevenue: '',
        totalExpenses: '',
        totalDebtsAdded: '',
        debtPayments: '',
        productProfit: ''
      });
      setShowAddForm(false);
      await loadDataFromAPI(); // Reload data
    } catch (error) {
      console.error('Failed to save profit:', error);
      alert('Foyda ma\'lumotini saqlashda xatolik yuz berdi');
    }
  };

  const handleDelete = async (profitId: number) => {
    if (window.confirm('Bu oylik foyda yozuvini o\'chirmoqchimisiz?')) {
      try {
        await apiService.deleteMonthlyProfit(profitId);
        await loadDataFromAPI(); // Reload data
      } catch (error) {
        console.error('Failed to delete profit:', error);
        alert('Foyda yozuvini o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const calculateAutoProfit = () => {
    const stats = calculateMonthlyStats(
      selectedMonth,
      expenses,
      debtRecords,
      payments,
      products,
      sales
    );
    
    setFormData({
      ...formData,
      totalRevenue: stats.totalRevenue.toString(),
      totalExpenses: stats.totalExpenses.toString(),
      totalDebtsAdded: stats.totalDebtsAdded.toString(),
      debtPayments: stats.debtPayments.toString(),
      productProfit: stats.productProfit.toString()
    });
  };

  const filteredProfits = [...monthlyProfits].sort(
      (a, b) => parseInt(b.month) - parseInt(a.month)
  );

  const totalYearlyProfit = monthlyProfits.reduce((s, p) => s + p.netProfit, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Foyda Boshqaruvi</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Oylik Foyda Qo'shish</span>
        </button>
      </div>

      {/* Yearly Summary */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {new Date().getFullYear()} Yillik Jami Foyda
            </h2>
            <p className="text-3xl font-bold">
              {formatCurrency(totalYearlyProfit)}
            </p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-full">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Monthly Profits Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Oylik Foyda Hisoboti</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jami Daromad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jami Xarajat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qarz Qo'shildi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qarz To'landi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahsulot Foydasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sof Foyda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfits.map((profit) => (
                <tr key={profit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {getMonthName(profit.month)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(profit.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    -{formatCurrency(profit.totalExpenses)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                    +{formatCurrency(profit.totalDebtsAdded)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +{formatCurrency(profit.debtPayments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    +{formatCurrency(profit.productProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${profit.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit.netProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Tahrirlash */}
                      <button
                        onClick={() => handleEdit(profit)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* O‘chirish */}
                      <button
                        onClick={() => handleDelete(profit.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProfits.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hozircha oylik foyda ma'lumotlari mavjud emas</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Profit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProfit ? 'Oylik Foydani Tahrirlash' : 'Yangi Oylik Foyda Qo\'shish'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oy
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">
                      {getMonthOptions().find(opt => opt.value === formData.month)?.label || 'Oy tanlang'}
                    </span>
                    <Filter className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-2">
                        <div className="max-h-48 overflow-y-auto">
                          {getMonthOptions().map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, month: option.value });
                                setShowDatePicker(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                                formData.month === option.value
                                  ? 'bg-green-100 text-green-700 font-medium'
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

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <button
                  type="button"
                  onClick={calculateAutoProfit}
                  className="w-full text-blue-700 hover:text-blue-900 text-sm font-medium"
                >
                  <Calculator className="w-4 h-4" />
                  Avtomatik hisoblash (tanlangan oy uchun)
                </button>
                <p className="text-xs text-blue-600 mt-1">
                  Bu tugma tanlangan oy uchun barcha ma'lumotlarni avtomatik hisoblab beradi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jami Daromad
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.totalRevenue}
                  onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jami Xarajat
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.totalExpenses}
                  onChange={(e) => setFormData({ ...formData, totalExpenses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qarz Qo'shildi
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.totalDebtsAdded}
                  onChange={(e) => setFormData({ ...formData, totalDebtsAdded: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qarz To'landi
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.debtPayments}
                  onChange={(e) => setFormData({ ...formData, debtPayments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mahsulot Foydasi
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.productProfit}
                  onChange={(e) => setFormData({ ...formData, productProfit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-gray-50 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sof Foyda:</span>
                  <span className={`text-lg font-bold ${
                    calculateNetProfit(
                      Number(formData.totalRevenue || 0),
                      Number(formData.totalExpenses || 0),
                      Number(formData.totalDebtsAdded || 0),
                      Number(formData.debtPayments || 0),
                      Number(formData.productProfit || 0)
                    ) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(calculateNetProfit(
                        Number(formData.totalRevenue || 0),
                        Number(formData.totalExpenses || 0),
                        Number(formData.totalDebtsAdded || 0),
                        Number(formData.debtPayments || 0),
                        Number(formData.productProfit || 0)
                    ))}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingProfit ? 'Yangilash' : 'Qo\'shish'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProfit(null);
                    setFormData({
                      month: getCurrentMonth(),
                      totalRevenue: '',
                      totalExpenses: '',
                      totalDebtsAdded: '',
                      debtPayments: '',
                      productProfit: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default ProfitManagement;