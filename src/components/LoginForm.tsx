import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {apiService} from "../services/api.ts";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    telegram: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test backend connection first
      try {
        await apiService.testConnection();
      } catch (connError) {
        throw new Error('Backend server bilan bog\'lanib bo\'lmadi. Iltimos, serverni ishga tushiring.');
      }
      
      if (isLogin) {
        await login(formData.telegram, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Parollar mos kelmaydi');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img
                src="/logo.png"
                alt="Steam Center Logo"
                className="w-40 h-40 object-contain"
            />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
            Steam Center
          </h1>
          {/*<h1 className="text-3xl font-bold text-gray-900">Steam Center</h1>*/}
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram Username
            </label>
            <input
              type="text"
              name="telegram"
              required
              value={formData.telegram}
              onChange={(e) => {
                let value = e.target.value;
                // Ensure @ prefix
                if (value && !value.startsWith('@')) {
                  value = '@' + value;
                }
                // Remove spaces and special characters except @
                value = value.replace(/[^a-zA-Z0-9@_]/g, '');
                setFormData({
                  ...formData,
                  telegram: value
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="@username"
            />
            <p className="text-xs text-gray-500 mt-1">
              Faqat harflar, raqamlar va _ belgisi ishlatiladi
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Parolni kiriting"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Kirish</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Steam Center Management System
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            Mijozlar, mahsulotlar va moliyaviy hisobotlarni boshqaring
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;