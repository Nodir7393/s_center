import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, Calendar, DollarSign, Filter, TrendingDown } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types/app-types';
import { ExpenseApi } from '../types/api-types';
import { toExpense, toExpensePayload } from '../helpers/mappers';
import { asArray } from '../helpers/http';
import { apiService } from '../services/api';
import { formatCurrency, getMonthName } from '../utils/calculations';

const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFormCategoryPicker, setShowFormCategoryPicker] = useState(false);
  const [formData, setFormData] = useState({
    category: 'rent' as ExpenseCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories: { value: ExpenseCategory; label: string }[] = [
    { value: 'rent', label: 'Ijara' },
    { value: 'internet', label: 'Internet' },
    { value: 'electricity', label: 'Elektr' },
    { value: 'tax', label: 'Soliq' },
    { value: 'salary', label: 'Maosh' },
    { value: 'personal', label: 'Shaxsiy' }
  ];

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
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const resp = await apiService.getExpenses(
          selectedMonth === 'all' ? undefined : selectedMonth
      );
      setExpenses(asArray<ExpenseApi>(resp).map(toExpense));
    } catch (error) {
      console.error('Failed to load expenses:', error);
      alert('Xarajatlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date.toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = toExpensePayload({
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
      });

      if (editingExpense) {
        await apiService.updateExpense(editingExpense.id, payload);
        setEditingExpense(null);
      } else {
        await apiService.createExpense(payload);
      }
      
      setFormData({
        category: 'rent',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Xarajatni saqlashda xatolik yuz berdi');
    }
  };

  const handleDelete = async (expenseId: number) => {
    if (window.confirm('Bu xarajatni o\'chirmoqchimisiz?')) {
      try {
        await apiService.deleteExpense(expenseId);
        loadData();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('Xarajatni o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expenseCategories.find(cat => cat.value === expense.category)?.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    const matchesMonth = selectedMonth === 'all' || expense.month === selectedMonth;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryStats = () => {
    const stats: Record<ExpenseCategory, number> = {
      rent: 0,
      internet: 0,
      electricity: 0,
      tax: 0,
      salary: 0,
      personal: 0
    };
    
    filteredExpenses.forEach(expense => {
      stats[expense.category] += expense.amount;
    });
    
    return stats;
  };

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Xarajatlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Xarajatlar</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi Xarajat</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Xarajat tavsifini qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedCategory === 'all' ? 'Barcha kategoriyalar' : expenseCategories.find(cat => cat.value === selectedCategory)?.label}
              </span>
              <Filter className="w-4 h-4 text-gray-400" />
            </button>

            {showCategoryPicker && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                    Kategoriya tanlang
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setShowCategoryPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      Barcha kategoriyalar
                    </button>
                    {expenseCategories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          setShowCategoryPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
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
                    {getMonthOptions().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedMonth(option.value);
                          setShowDatePicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                          selectedMonth === option.value
                            ? 'bg-orange-100 text-orange-700 font-medium'
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

        {/* Click outside to close date picker */}
        {showDatePicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDatePicker(false)}
          />
        )}

        {/* Click outside to close category picker */}
        {showCategoryPicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCategoryPicker(false)}
          />
        )}

        {/* Click outside to close form category picker */}
        {showFormCategoryPicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowFormCategoryPicker(false)}
          />
        )}

        {/* Filter Info */}
        {(selectedMonth !== 'all' || selectedCategory !== 'all') && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-orange-800 text-sm">
                {selectedMonth !== 'all' && (
                  <span className="font-medium">{getMonthName(selectedMonth)}</span>
                )}
                {selectedMonth !== 'all' && selectedCategory !== 'all' && ' - '}
                {selectedCategory !== 'all' && (
                  <span className="font-medium">
                    {expenseCategories.find(cat => cat.value === selectedCategory)?.label}
                  </span>
                )}
                {' uchun xarajatlar ko\'rsatilmoqda'}
              </p>
              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedCategory('all');
                }}
                className="text-orange-600 hover:text-orange-800 text-sm underline"
              >
                Barchasini ko'rish
              </button>
            </div>
          </div>
        )}

        {/* Total Expenses */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {selectedMonth === 'all' ? 'Jami Xarajatlar' : `${getMonthName(selectedMonth)} Xarajatlari`}
              </h2>
              <p className="text-3xl font-bold">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Category Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((category) => (
            <div key={category.value} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{category.label}</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(categoryStats[category.value])}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoriya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tavsif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miqdor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 hidden sm:table-row-group">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {expenseCategories.find(cat => cat.value === expense.category)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.date.toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-2">
                        {expenseCategories.find(cat => cat.value === expense.category)?.label}
                      </span>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {expense.date.toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold text-red-600">
                        -{formatCurrency(expense.amount)}
                      </p>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full bg-blue-50"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full bg-red-50"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Xarajatlar topilmadi</p>
            </div>
          )}
        </div>
      </div>
      {/* Add/Edit Expense Modal */}
      {showAddForm && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingExpense ? 'Xarajatni Tahrirlash' : 'Yangi Xarajat Qo\'shish'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya
                  </label>
                  <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowFormCategoryPicker(!showFormCategoryPicker)}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-900 font-medium">
                        {expenseCategories.find(cat => cat.value === formData.category)?.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
                          {expenseCategories.find(cat => cat.value === formData.category)?.label}
                        </span>
                        <Filter className="w-4 h-4 text-orange-500" />
                      </div>
                    </button>

                    {showFormCategoryPicker && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-2">
                            <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide px-3 py-2 bg-orange-50 rounded-lg mb-2">
                              Kategoriya tanlang
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {expenseCategories.map((category) => (
                                  <button
                                      key={category.value}
                                      type="button"
                                      onClick={() => {
                                        setFormData({ ...formData, category: category.value });
                                        setShowFormCategoryPicker(false);
                                      }}
                                      className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-orange-50 transition-all duration-200 flex items-center justify-between group ${
                                          formData.category === category.value
                                              ? 'bg-orange-100 text-orange-800 font-semibold border-l-4 border-orange-500'
                                              : 'text-gray-700 hover:text-orange-700'
                                      }`}
                                  >
                                    <span>{category.label}</span>
                                    {formData.category === category.value && (
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    )}
                                  </button>
                              ))}
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miqdor
                  </label>
                  <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tavsif
                  </label>
                  <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sana
                  </label>
                  <div className="relative group">
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm text-gray-900 font-medium"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="bg-orange-100 p-1.5 rounded-lg group-hover:bg-orange-200 transition-colors duration-200">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    {editingExpense ? 'Yangilash' : 'Qo\'shish'}
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingExpense(null);
                        setFormData({
                          category: 'rent',
                          amount: '',
                          description: '',
                          date: new Date().toISOString().split('T')[0]
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
    </>
  );
};

export default ExpenseManagement;