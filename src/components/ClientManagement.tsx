import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, DollarSign, CreditCard, History, X, Users, Calendar, Filter } from 'lucide-react';
import { Client, Payment, DebtRecord } from '../types/app-types';
import { apiService } from '../services/api';
import { formatCurrency, getMonthName } from '../utils/calculations';
import { asArray } from '../helpers/http';
import { toClient, toPayment, toDebtRecord } from '../helpers/mappers';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBulkDebtForm, setShowBulkDebtForm] = useState(false);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegram: '',
    totalDebt: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: ''
  });
  const [debtData, setDebtData] = useState({
    amount: '',
    description: ''
  });
  const [bulkDebtData, setBulkDebtData] = useState({
    amount: '',
    description: ''
  });

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

  const loadData = () => {
    loadDataFromAPI();
  };

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      const [clientsRes, paymentsRes, debtsRes] = await Promise.all([
        apiService.getClients(),
        apiService.getPayments(),
        apiService.getDebtRecords()
      ]);

      setClients(asArray(clientsRes).map(toClient));
      setPayments(asArray(paymentsRes).map(toPayment));
      setDebtRecords(asArray(debtsRes).map(toDebtRecord));
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const clientData = await apiService.createClient({
        name: formData.name,
        telephone: formData.phone,
        telegram: formData.telegram,
      });
      
      // If initial debt, create debt record
      if (Number(formData.totalDebt) > 0) {
        await apiService.createDebtRecord({
          client_id: clientData.id,
          amount: Number(formData.totalDebt),
          description: 'Dastlabki qarz',
          type: 'initial'
        });
      }
      
      setFormData({ name: '', phone: '', telegram: '', totalDebt: '' });
      setShowAddForm(false);
      loadDataFromAPI(); // Reload data
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Mijoz qo\'shishda xatolik yuz berdi');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await apiService.createPayment({
        client_id: selectedClient.id,
        amount: Number(paymentData.amount),
        description: paymentData.description || null
      });

      setPaymentData({ amount: '', description: '' });
      setShowPaymentForm(false);
      setSelectedClient(null);
      loadDataFromAPI(); // Reload data
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('To\'lov qilishda xatolik yuz berdi');
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await apiService.createDebtRecord({
        client_id: selectedClient.id,
        amount: Number(debtData.amount),
        description: debtData.description || 'Qo\'shimcha qarz',
        type: 'additional'
      });

      setDebtData({ amount: '', description: '' });
      setShowDebtForm(false);
      setSelectedClient(null);
      loadDataFromAPI(); // Reload data
    } catch (error) {
      console.error('Failed to add debt:', error);
      alert('Qarz qo\'shishda xatolik yuz berdi');
    }
  };

  const handleBulkDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClients.length === 0) return;

    try {
      // Create debt records for all selected clients
      await Promise.all(
        selectedClients.map((clientId) =>
          apiService.createDebtRecord({
            client_id: clientId, // id’lar string bo‘lsa — to‘g‘ri
            amount: Number(bulkDebtData.amount),
            description: bulkDebtData.description || "Ommaviy qarz qo'shish",
            type: 'additional',
          })
        )
      );

      setBulkDebtData({ amount: '', description: '' });
      setSelectedClients([]);
      setShowBulkDebtForm(false);
      await loadDataFromAPI(); // Reload data
    } catch (error) {
      console.error('Failed to add bulk debt:', error);
      alert('Ommaviy qarz qo\'shishda xatolik yuz berdi');
    }
  };

  const handleClientSelection = (clientId: number) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Bu mijozni o\'chirmoqchimisiz?')) {
      try {
        await apiService.deleteClient(clientId);
        loadDataFromAPI(); // Reload data
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Mijozni o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getClientPayments = (clientId: number) => {
    return payments.filter(payment => payment.clientId === clientId);
  };

  const getClientDebtRecords = (clientId: number) => {
    return debtRecords.filter(record => record.clientId === clientId);
  };

  const getClientHistory = (clientId: number) => {
    const allClientPayments = getClientPayments(clientId);
    const allClientDebts = getClientDebtRecords(clientId);
    const monthOf = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
    
    const filteredPayments = selectedMonth === 'all' 
      ? allClientPayments
      : allClientPayments.filter(p => monthOf(p.date) === selectedMonth);
    
    const filteredDebts = selectedMonth === 'all'
      ? allClientDebts
      : allClientDebts.filter(d => d.month ? d.month === selectedMonth : monthOf(d.date) === selectedMonth);
    
    const clientPayments = filteredPayments
      .map(payment => ({
        ...payment,
        type: 'payment' as const
      }));
    
    const clientDebts = filteredDebts
      .map(debt => ({
        ...debt,
        type: 'debt' as const
      }));
    
    return [...clientPayments, ...clientDebts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Oylik statistikalar
  const getMonthlyStats = () => {
    const filteredDebtRecords = selectedMonth === 'all' 
      ? debtRecords 
      : debtRecords.filter(record => record.month === selectedMonth);
    
    const filteredPayments = selectedMonth === 'all'
      ? payments
      : payments.filter(payment => {
          const paymentDate = new Date(payment.date);
          const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
          return paymentMonth === selectedMonth;
        });
    
    const monthlyDebts = filteredDebtRecords.reduce((sum, record) => sum + record.amount, 0);
    const monthlyPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalDebts: monthlyDebts,
      totalPayments: monthlyPayments,
      remainingDebt: monthlyDebts - monthlyPayments
    };
  };

  // Mijozlarni oylik filter bo'yicha filterlash
  const getFilteredClients = () => {
    if (selectedMonth === 'all') {
      return filteredClients;
    }
    
    // Tanlangan oyda qarz olgan yoki to'lov qilgan mijozlarni topish
    const clientsWithActivity = new Set<number>();
    
    // Qarz olgan mijozlar
    debtRecords
      .filter(record => record.month === selectedMonth)
      .forEach(record => clientsWithActivity.add(record.clientId));
    
    // To'lov qilgan mijozlar
    payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        return paymentMonth === selectedMonth;
      })
      .forEach(payment => clientsWithActivity.add(payment.clientId));
    
    return filteredClients.filter(client => clientsWithActivity.has(client.id));
  };

  const monthlyStats = getMonthlyStats();
  const displayClients = getFilteredClients();

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

  const handleSelectAll = () => {
    if (selectedClients.length === displayClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(displayClients.map(client => client.id));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mijozlar</h1>
          <div className="flex space-x-2">
            {selectedClients.length > 0 && (
              <button
                onClick={() => setShowBulkDebtForm(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Qarz Qo'shish ({selectedClients.length})</span>
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Yangi Mijoz</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Mijoz ismini yoki telefon raqamini qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
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
                    {getMonthOptions().map((option) => (
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

        {/* Click outside to close date picker */}
        {showDatePicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDatePicker(false)}
          />
        )}

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oylik Jami Qarz</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(monthlyStats.totalDebts)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oylik To'langan</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyStats.totalPayments)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oylik Qolgan Qarz</p>
                <p className={`text-xl font-bold ${monthlyStats.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(monthlyStats.remainingDebt)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${monthlyStats.remainingDebt > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <History className={`w-5 h-5 ${monthlyStats.remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)}
            </p>
          </div>
        </div>

        {/* Selection Info */}
        {selectedClients.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-orange-800">
                {selectedClients.length} ta mijoz tanlandi
              </p>
              <button
                onClick={() => setSelectedClients([])}
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Tanlovni bekor qilish
              </button>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === displayClients.length && displayClients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mijoz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jami Qarz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To'langan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qolgan Qarz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 hidden sm:table-row-group">
                {displayClients.map((client) => {
                  const remainingDebt = client.totalDebt - client.paidAmount;
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleClientSelection(client.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          {client.telegram && (
                            <p className="text-sm text-gray-500">{client.telegram}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(client.totalDebt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(client.paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(remainingDebt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowHistoryModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Tarix ko'rish"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowPaymentForm(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="To'lov qilish"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDebtForm(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded"
                            title="Qarz qo'shish"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {displayClients.map((client) => {
                const remainingDebt = client.totalDebt - client.paidAmount;
                const isSelected = selectedClients.includes(client.id);
                return (
                  <div key={client.id} className={`p-4 border-b border-gray-200 ${isSelected ? 'bg-purple-50' : ''}`}>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleClientSelection(client.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{client.name}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                        {client.telegram && (
                          <p className="text-sm text-gray-500">{client.telegram}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowHistoryModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full bg-blue-50"
                          title="Tarix ko'rish"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowPaymentForm(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-2 rounded-full bg-green-50"
                          title="To'lov qilish"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowDebtForm(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 p-2 rounded-full bg-orange-50"
                          title="Qarz qo'shish"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full bg-red-50"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Jami Qarz</p>
                        <p className="font-medium">{formatCurrency(client.totalDebt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">To'langan</p>
                        <p className="font-medium text-green-600">{formatCurrency(client.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Qolgan</p>
                        <p className={`font-medium ${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(remainingDebt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Debt Modal */}
      {showBulkDebtForm && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Bir nechta mijozga qarz qo'shish
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  Tanlangan mijozlar: {selectedClients.length} ta
                </p>
                <div className="max-h-32 overflow-y-auto">
                  {selectedClients.map(clientId => {
                    const client = clients.find(c => c.id === clientId);
                    return client ? (
                        <p key={clientId} className="text-sm text-gray-700">
                          • {client.name}
                        </p>
                    ) : null;
                  })}
                </div>
              </div>
              <form onSubmit={handleBulkDebt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Har biriga qo'shiladigan qarz miqdori
                  </label>
                  <input
                      type="number"
                      min="0"
                      required
                      placeholder="Qarz miqdorini kiriting"
                      value={bulkDebtData.amount}
                      onChange={(e) => setBulkDebtData({ ...bulkDebtData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={bulkDebtData.description}
                      onChange={(e) => setBulkDebtData({ ...bulkDebtData, description: e.target.value })}
                      placeholder="Masalan: Yangi manga to'plami uchun"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    Jami qo'shiladigan qarz: {formatCurrency(Number(bulkDebtData.amount || 0) * selectedClients.length)}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Barchaga Qarz Qo'shish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowBulkDebtForm(false);
                        setBulkDebtData({ amount: '', description: '' });
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

      {/* Add Client Modal */}
      {showAddForm && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yangi Mijoz Qo'shish</h2>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ism
                  </label>
                  <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.startsWith('998')) {
                          value = value.slice(3);
                        }
                        if (value.length <= 9) {
                          const formatted = value.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
                          setFormData({ ...formData, phone: `+998 ${formatted}` });
                        }
                      }}
                      placeholder="+998 XX XXX XX XX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram Username (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value && !value.startsWith('@')) {
                          value = '@' + value;
                        }
                        setFormData({ ...formData, telegram: value });
                      }}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dastlabki Qarz Miqdori
                  </label>
                  <input
                      type="number"
                      min="0"
                      placeholder="Qarz miqdorini kiriting"
                      value={formData.totalDebt}
                      onChange={(e) => setFormData({ ...formData, totalDebt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Qo'shish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({
                          name: '',
                          phone: '',
                          telegram: '',
                          totalDebt: ''
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

      {/* Client History Modal */}
      {showHistoryModal && selectedClient && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl m-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedClient.name} - To'lov va Qarz Tarixi ({selectedMonth === 'all' ? 'Hamma vaqt' : getMonthName(selectedMonth)})
                </h2>
                <button
                    onClick={() => {
                      setShowHistoryModal(false);
                      setSelectedClient(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Client Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Jami Qarz</p>
                    <p className="font-medium text-lg">
                      {selectedMonth === 'all'
                          ? formatCurrency(selectedClient.totalDebt)
                          : formatCurrency(getClientHistory(selectedClient.id)
                              .filter(record => record.type === 'debt')
                              .reduce((sum, record) => sum + record.amount, 0))
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">To'langan</p>
                    <p className="font-medium text-lg text-green-600">
                      {selectedMonth === 'all'
                          ? formatCurrency(selectedClient.paidAmount)
                          : formatCurrency(getClientHistory(selectedClient.id)
                              .filter(record => record.type === 'payment')
                              .reduce((sum, record) => sum + record.amount, 0))
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Qolgan Qarz</p>
                    <p className={`font-medium text-lg`}>
                      {(() => {
                        const history = getClientHistory(selectedClient.id);
                        const debts = history.filter(record => record.type === 'debt').reduce((sum, record) => sum + record.amount, 0);
                        const payments = history.filter(record => record.type === 'payment').reduce((sum, record) => sum + record.amount, 0);
                        const remaining = selectedMonth === 'all'
                            ? selectedClient.totalDebt - selectedClient.paidAmount
                            : debts - payments;
                        return (
                            <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(remaining)}
                          </span>
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {getClientHistory(selectedClient.id).length > 0 ? (
                      getClientHistory(selectedClient.id).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                  record.type === 'payment' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                {record.type === 'payment' ? (
                                    <DollarSign className={`w-4 h-4 ${
                                        record.type === 'payment' ? 'text-green-600' : 'text-orange-600'
                                    }`} />
                                ) : (
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {record.type === 'payment' ? 'To\'lov' : 'Qarz'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {record.description || (record.type === 'payment' ? 'To\'lov' : 'Qarz qo\'shildi')}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(record.date).toLocaleDateString('uz-UZ', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                  record.type === 'payment' ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {record.type === 'payment' ? '-' : '+'}{formatCurrency(record.amount)}
                              </p>
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {selectedMonth === 'all' ? 'Tarix mavjud emas' : 'Bu oyda tarix mavjud emas'}
                        </p>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Add Debt Modal */}
      {showDebtForm && selectedClient && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Qarz qo'shish - {selectedClient.name}
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Hozirgi jami qarz: {formatCurrency(selectedClient.totalDebt)}
                </p>
                <p className="text-sm text-gray-600">
                  Qolgan qarz: {formatCurrency(selectedClient.totalDebt - selectedClient.paidAmount)}
                </p>
              </div>
              <form onSubmit={handleAddDebt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qo'shiladigan qarz miqdori
                  </label>
                  <input
                      type="number"
                      min="0"
                      required
                      placeholder="Qarz miqdorini kiriting"
                      value={debtData.amount}
                      onChange={(e) => setDebtData({ ...debtData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={debtData.description}
                      onChange={(e) => setDebtData({ ...debtData, description: e.target.value })}
                      placeholder="Masalan: Yangi o'yinlar uchun"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Qarz qo'shish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowDebtForm(false);
                        setSelectedClient(null);
                        setDebtData({ amount: '', description: '' });
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

      {/* Payment Modal */}
      {showPaymentForm && selectedClient && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                To'lov qilish - {selectedClient.name}
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Qolgan qarz: {formatCurrency(selectedClient.totalDebt - selectedClient.paidAmount)}
                </p>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To'lov miqdori
                  </label>
                  <input
                      type="number"
                      min="0"
                      max={selectedClient ? selectedClient.totalDebt - selectedClient.paidAmount : undefined}
                      required
                      placeholder="To'lov miqdorini kiriting"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={paymentData.description}
                      onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    To'lov qilish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedClient(null);
                        setPaymentData({ amount: '', description: '' });
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

export default ClientManagement;