import React, { useState } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { storage } from '../utils/storage';

const Settings: React.FC = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleExportData = () => {
    const data = {
      clients: storage.clients.get(),
      expenses: storage.expenses.get(),
      payments: storage.payments.get(),
      debtRecords: storage.debtRecords.get(),
      monthlyProfits: storage.monthlyProfits.get(),
      products: storage.products.get(),
      stockEntries: storage.stockEntries.get(),
      sales: storage.sales.get(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manga-club-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.clients && data.expenses && data.payments) {
          storage.clients.set(data.clients);
          storage.expenses.set(data.expenses);
          storage.payments.set(data.payments);
          if (data.debtRecords) {
            storage.debtRecords.set(data.debtRecords);
          }
          if (data.monthlyProfits) {
            storage.monthlyProfits.set(data.monthlyProfits);
          }
          if (data.products) {
            storage.products.set(data.products);
          }
          if (data.stockEntries) {
            storage.stockEntries.set(data.stockEntries);
          }
          if (data.sales) {
            storage.sales.set(data.sales);
          }
          
          alert('Ma\'lumotlar muvaffaqiyatli yuklandi! Sahifani qayta yuklab oling.');
          window.location.reload();
        } else {
          alert('Noto\'g\'ri fayl formati!');
        }
      } catch (error) {
        alert('Faylni o\'qishda xatolik yuz berdi!');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    localStorage.removeItem('manga-club-clients');
    localStorage.removeItem('manga-club-expenses');
    localStorage.removeItem('manga-club-payments');
    localStorage.removeItem('manga-club-debt-records');
    localStorage.removeItem('manga-club-monthly-profits');
    localStorage.removeItem('manga-club-products');
    localStorage.removeItem('manga-club-stock-entries');
    localStorage.removeItem('manga-club-sales');
    
    alert('Barcha ma\'lumotlar o\'chirildi! Sahifani qayta yuklab oling.');
    window.location.reload();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hozirgi parolni tekshirish
    const savedPassword = localStorage.getItem('steam-center-password');
    if (savedPassword && savedPassword !== passwordData.currentPassword) {
      alert('Hozirgi parol noto\'g\'ri!');
      return;
    }
    
    // Yangi parollarni tekshirish
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yangi parollar mos kelmaydi!');
      return;
    }
    
    if (passwordData.newPassword.length < 4) {
      alert('Parol kamida 4 ta belgidan iborat bo\'lishi kerak!');
      return;
    }
    
    // Yangi parolni saqlash
    localStorage.setItem('steam-center-password', passwordData.newPassword);
    
    alert('Parol muvaffaqiyatli o\'zgartirildi!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const getDataStats = () => {
    const clients = storage.clients.get();
    const expenses = storage.expenses.get();
    const payments = storage.payments.get();
    const debtRecords = storage.debtRecords.get();
    const monthlyProfits = storage.monthlyProfits.get();
    const products = storage.products.get();
    const stockEntries = storage.stockEntries.get();
    const sales = storage.sales.get();

    return {
      clientsCount: clients.length,
      expensesCount: expenses.length,
      paymentsCount: payments.length,
      debtRecordsCount: debtRecords.length,
      monthlyProfitsCount: monthlyProfits.length,
      productsCount: products.length,
      stockEntriesCount: stockEntries.length,
      salesCount: sales.length,
      totalSize: new Blob([JSON.stringify({ 
        clients, expenses, payments, debtRecords, monthlyProfits, 
        products, stockEntries, sales 
      })]).size
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sozlamalar</h1>
      </div>

      {/* Data Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Ma'lumotlar Statistikasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Mijozlar</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-800">{stats.clientsCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Xarajatlar</p>
            <p className="text-xl sm:text-2xl font-bold text-green-800">{stats.expensesCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">To'lovlar</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-800">{stats.paymentsCount}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Qarz Yozuvlari</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-800">{stats.debtRecordsCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Oylik Foyda</p>
            <p className="text-xl sm:text-2xl font-bold text-green-800">{stats.monthlyProfitsCount}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Mahsulotlar</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-800">{stats.productsCount}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Ombor Yozuvlari</p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-800">{stats.stockEntriesCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Sotuvlar</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-800">{stats.salesCount}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 font-medium">Hajmi</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {(stats.totalSize / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Parol Boshqaruvi
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
            <div>
              <h3 className="font-medium text-gray-900">Parolni O'zgartirish</h3>
              <p className="text-sm text-gray-600">
                Xavfsizlik uchun parolni muntazam o'zgartiring
              </p>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Parolni O'zgartirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Zaxira Nusxa va Tiklash
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
            <div>
              <h3 className="font-medium text-gray-900">Ma'lumotlarni Eksport Qilish</h3>
              <p className="text-sm text-gray-600">
                Barcha ma'lumotlarni JSON formatida saqlash
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Eksport</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
            <div>
              <h3 className="font-medium text-gray-900">Ma'lumotlarni Import Qilish</h3>
              <p className="text-sm text-gray-600">
                Zaxira nusxadan ma'lumotlarni tiklash
              </p>
            </div>
            <label className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Xavfli Zona
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-lg space-y-3 sm:space-y-0">
            <div>
              <h3 className="font-medium text-red-900">Barcha Ma'lumotlarni O'chirish</h3>
              <p className="text-sm text-red-600">
                Diqqat! Bu amal ortga qaytarilmaydi
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>O'chirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
            <h2 className="text-xl font-bold text-red-900 mb-4">
              Barcha Ma'lumotlarni O'chirish
            </h2>
            <p className="text-gray-600 mb-6">
              Siz barcha mijozlar, xarajatlar va to'lovlar ma'lumotlarini o'chirmoqchimisiz. 
              Bu amal ortga qaytarilmaydi!
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAllData}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Ha, O'chirish
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Bekor Qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Parolni O'zgartirish
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hozirgi Parol
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Hozirgi parolni kiriting"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yangi Parol
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Yangi parolni kiriting"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Kamida 4 ta belgi bo'lishi kerak
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yangi Parolni Tasdiqlash
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Yangi parolni qayta kiriting"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Eslatma:</strong> Parolni unutmang! Parolsiz tizimga kira olmaysiz.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Parolni O'zgartirish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Bekor Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;