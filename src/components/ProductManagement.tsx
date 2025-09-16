import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, Package, AlertTriangle, Filter, DollarSign, ShoppingCart, History, PackagePlus, X } from 'lucide-react';
import { Product } from '../types/app-types';
import { ProductApi, StockEntryApi, SaleApi } from '../types/api-types';
import { apiService } from '../services/api';
import { asArray } from '../helpers/http';
import { toProduct, toSale, toStockEntry } from '../helpers/mappers';
import { formatCurrency } from '../utils/calculations';

type ProductForm = {
  name: string;
  categoryId: number | null;   // ✅ "" emas, null
  purchasePrice: string;
  salePrice: string;
  stockQuantity: string;
  minQuantity: string;
};

type ProductEvent = {
  id: number;
  kind: 'stock' | 'sale';
  quantity: number;
  unitPrice: number;
  total: number;
  date: Date;
  description?: string;
};

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFormCategoryPicker, setShowFormCategoryPicker] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [productHistory, setProductHistory] = useState<ProductEvent[]>([]);
  const [soldSummary, setSoldSummary] = useState({ times: 0, qty: 0, amount: 0, lastPurchasePrice: null as number | null });
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    categoryId: null,            // ✅
    purchasePrice: '',
    salePrice: '',
    stockQuantity: '',
    minQuantity: ''
  });
  const [stockData, setStockData] = useState({
    quantity: '',
    purchasePrice: '',
    description: ''
  });
  const [saleData, setSaleData] = useState({
    quantity: '',
    salePrice: '',
    description: ''
  });

  const PRODUCT_CATEGORIES = [
    { code: 1, label: "Ichimliklar" },
    { code: 2, label: "Yeyiladigan narsalar" },
    { code: 0, label: "Boshqalar" },
  ];

  const categories = [
    { id: 1, name: 'Ichimliklar' },
    { id: 2, name: 'Yeyiladigan narsalar' },
    { id: 0, name: 'Boshqalar' },
  ] as const;

  const categoryLabel = (id: number) =>
      categories.find(c => c.id === id)?.name ?? 'Noma’lum';

  const getCategoryLabel = (code: number | '') =>
      typeof code === 'number'
          ? (PRODUCT_CATEGORIES.find(c => c.code === code)?.label ?? "Noma’lum")
          : "Kategoriya tanlang";

  const CATEGORY_OPTIONS = [
    { id: 1, label: 'Ichimliklar' }, // DRINKS
    { id: 2, label: 'Yeyiladigan narsalar' }, // EDIBLES
    { id: 0, label: 'Boshqalar' }, // OTHERS
  ];

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const productsRes = await apiService.getProducts();
      setProducts(asArray<ProductApi>(productsRes).map(toProduct));
    } catch (error) {
      console.error('Failed to load products:', error);
      alert("Mahsulotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.category,
      purchasePrice: product.purchasePrice.toString(),
      salePrice: product.salePrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      minQuantity: product.minQuantity.toString()
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryId == null) {
      alert('Kategoriya tanlanmagan');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.categoryId, // number ✅
      purchase_price: Number(formData.purchasePrice),
      sale_price: Number(formData.salePrice),
      stock_quantity: Number(formData.stockQuantity),
      min_quantity: Number(formData.minQuantity),
    };

    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, payload);
        setEditingProduct(null);
      } else {
        await apiService.createProduct(payload);
      }
      setFormData({
        name: '',
        categoryId: null,
        purchasePrice: '',
        salePrice: '',
        stockQuantity: '',
        minQuantity: ''
      });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Mahsulotni saqlashda xatolik yuz berdi');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await apiService.addStock(selectedProduct.id, {
        quantity: Number(stockData.quantity),
        unit_price: Number(stockData.purchasePrice),
        description: stockData.description || null,
      });

      setStockData({ quantity: '', purchasePrice: '', description: '' });
      setShowStockForm(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('Ombor qo\'shishda xatolik yuz berdi');
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await apiService.recordSale(selectedProduct.id, {
        quantity: Number(saleData.quantity),
        unit_price: Number(saleData.salePrice),
        description: saleData.description || null,
      });

      setSaleData({ quantity: '', salePrice: '', description: '' });
      setShowSaleForm(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      console.error('Failed to record sale:', error);
      alert('Sotuvni qayd qilishda xatolik yuz berdi');
    }
  };

  const handleDelete = async (productId: number) => {  // <— string emas
    if (window.confirm("Bu mahsulotni o'chirmoqchimisiz?")) {
      await apiService.deleteProduct(productId);
      loadData();
    }
  };

  // === Tarixni backenddan olish ===
  const handleShowHistory = async (p: Product) => {
    setSelectedProduct(p);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const [stocksRaw, salesRaw] = await Promise.all([
        apiService.getProductStockEntries(p.id),
        apiService.getProductSales(p.id),
      ]);

      const stocks = asArray<StockEntryApi>(stocksRaw).map(toStockEntry).map(s => ({
        id: s.id, kind: 'stock' as const, quantity: s.quantity,
        unitPrice: s.purchasePrice, total: s.totalCost, date: s.date, description: s.description,
      }));

      const sales = asArray<SaleApi>(salesRaw).map(toSale).map(s => ({
        id: s.id, kind: 'sale' as const, quantity: s.quantity,
        unitPrice: s.salePrice, total: s.totalAmount, date: s.date, description: s.description,
      }));

      const merged = [...stocks, ...sales].sort((a, b) => b.date.getTime() - a.date.getTime());
      setProductHistory(merged);

      const lastPurchase = stocks.sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.unitPrice ?? null;
      const saleStats = sales.reduce((acc, s) => ({ times: acc.times + 1, qty: acc.qty + s.quantity, amount: acc.amount + s.total }),
          { times: 0, qty: 0, amount: 0 });
      setSoldSummary({ times: saleStats.times, qty: saleStats.qty, amount: saleStats.amount, lastPurchasePrice: lastPurchase });
    } catch (e) {
      console.error('Failed to load product history:', e);
      alert('Tarixni yuklashda xatolik yuz berdi');
      setShowHistoryModal(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryLabel(p.category).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ? true : p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.stockQuantity <= product.minQuantity);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stockQuantity * product.purchasePrice), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Mahsulotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi Mahsulot</span>
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-800 font-medium">Kam qolgan mahsulotlar</h3>
            </div>
            <div className="space-y-1">
              {lowStockProducts.slice(0, 3).map(product => (
                <p key={product.id} className="text-red-700 text-sm">
                  • {product.name} - {product.stockQuantity} ta qoldi (minimal: {product.minQuantity})
                </p>
              ))}
              {lowStockProducts.length > 3 && (
                <p className="text-red-700 text-sm">
                  ... va yana {lowStockProducts.length - 3} ta mahsulot
                </p>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jami Mahsulotlar</p>
                <p className="text-xl font-bold text-blue-600">{totalProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kam Qolgan</p>
                <p className="text-xl font-bold text-red-600">{lowStockProducts.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jami Qiymat</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Mahsulot nomini qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedCategory === 'all' ? 'Barcha kategoriyalar' : categoryLabel(selectedCategory)}
              </span>
              <Filter className="w-4 h-4 text-blue-500" />
            </button>

            {showCategoryPicker && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                    Kategoriya tanlang
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <button
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${selectedCategory === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedCategory('all');
                        setShowCategoryPicker(false);
                      }}
                    >
                      Barcha kategoriyalar
                    </button>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${selectedCategory === opt.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                        onClick={() => {
                          setSelectedCategory(opt.id);
                          setShowCategoryPicker(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahsulot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoriya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sotib Olish
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sotish
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ombor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 hidden sm:table-row-group">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(product.salePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stockQuantity} ta
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stockQuantity <= product.minQuantity ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Kam qoldi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yetarli
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Tarix (ko‘rish) */}
                        <button
                            onClick={() => handleShowHistory(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Tarix ko'rish"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Omborga qo‘shish */}
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowStockForm(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Ombor qo'shish"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowSaleForm(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Sotish"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {/* Tarix */}
                      <button
                          onClick={() => handleShowHistory(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full bg-blue-50"
                          title="Tarix ko'rish"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockForm(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full bg-green-50"
                        title="Ombor qo'shish"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowSaleForm(true);
                        }}
                        className="text-purple-600 hover:text-purple-900 p-2 rounded-full bg-purple-50"
                        title="Sotish"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full bg-blue-50"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full bg-red-50"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Sotib olish</p>
                      <p className="font-medium">{formatCurrency(product.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sotish</p>
                      <p className="font-medium text-green-600">{formatCurrency(product.salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ombor</p>
                      <p className="font-medium">{product.stockQuantity} ta</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Holat</p>
                      {product.stockQuantity <= product.minQuantity ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Kam qoldi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yetarli
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Mahsulotlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomi
                  </label>
                  <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriya
                  </label>
                  <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowFormCategoryPicker(v => !v)}
                        className="flex items-center justify-between w-full px-4 py-2
                                 bg-white border border-gray-300 rounded-lg shadow-sm
                                 hover:bg-gray-50 focus:outline-none focus:ring-2
                                 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <span className="text-sm text-gray-900">
                        {formData.categoryId === null
                            ? 'Kategoriya tanlang'
                            : categoryLabel(formData.categoryId)}
                      </span>
                      <Filter className="w-4 h-4 text-blue-500"/>
                    </button>

                    {showFormCategoryPicker && (
                        <div
                            className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-w-full">
                          <div className="p-2">
                            <div
                                className="text-xs font-semibold text-blue-600 uppercase tracking-wide px-3 py-2 bg-blue-50 rounded-lg mb-2">
                              Kategoriya tanlang
                            </div>
                            <div className="max-h-64 overflow-y-auto py-1">
                              {categories.map((cat) => {
                                const active = formData.categoryId === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                          setFormData(fd => ({...fd, categoryId: cat.id}));
                                          setShowFormCategoryPicker(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md
                            hover:bg-gray-100 transition-colors
                            ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                    >
                                      {cat.name}
                                    </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sotib Olish Narxi
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sotish Narxi
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ombor Miqdori
                    </label>
                    <input
                        type="number"
                        min="0"
                        required
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimal Miqdor
                    </label>
                    <input
                        type="number"
                        min="0"
                        required
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingProduct ? 'Yangilash' : 'Qo\'shish'}
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                        setShowFormCategoryPicker(false);
                        setFormData({
                          name: '',
                          categoryId: null,
                          purchasePrice: '',
                          salePrice: '',
                          stockQuantity: '',
                          minQuantity: ''
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

      {/* Add Stock Modal */}
      {showStockForm && selectedProduct && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ombor Qo'shish - {selectedProduct.name}
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Hozirgi ombor: {selectedProduct.stockQuantity} ta
                </p>
              </div>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miqdor
                  </label>
                  <input
                      type="number"
                      min="1"
                      required
                      value={stockData.quantity}
                      onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sotib Olish Narxi
                  </label>
                  <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={stockData.purchasePrice}
                      onChange={(e) => setStockData({ ...stockData, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={stockData.description}
                      onChange={(e) => setStockData({ ...stockData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Ombor Qo'shish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowStockForm(false);
                        setSelectedProduct(null);
                        setStockData({ quantity: '', purchasePrice: '', description: '' });
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

      {/* Record Sale Modal */}
      {showSaleForm && selectedProduct && (
          <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl m-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sotish - {selectedProduct.name}
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Mavjud: {selectedProduct.stockQuantity} ta
                </p>
                <p className="text-sm text-gray-600">
                  Tavsiya etilgan narx: {formatCurrency(selectedProduct.salePrice)}
                </p>
              </div>
              <form onSubmit={handleRecordSale} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miqdor
                  </label>
                  <input
                      type="number"
                      min="1"
                      max={selectedProduct.stockQuantity}
                      required
                      value={saleData.quantity}
                      onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sotish Narxi
                  </label>
                  <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={saleData.salePrice}
                      onChange={(e) => setSaleData({ ...saleData, salePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                      type="text"
                      value={saleData.description}
                      onChange={(e) => setSaleData({ ...saleData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    Jami: {formatCurrency(Number(saleData.quantity || 0) * Number(saleData.salePrice || 0))}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Sotishni Qayd Qilish
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        setShowSaleForm(false);
                        setSelectedProduct(null);
                        setSaleData({ quantity: '', salePrice: '', description: '' });
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

      {/* Tarix modali */}
      {showHistoryModal && selectedProduct && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-bold">{selectedProduct.name} — Tarix</h3>
                <button
                    onClick={() => { setShowHistoryModal(false); setSelectedProduct(null); }}
                    className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Hozirgi miqdor</p>
                  <p className="text-base font-semibold">{selectedProduct.stockQuantity} ta</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Oxirgi olib kelish narxi</p>
                  <p className="text-base font-semibold">
                    {soldSummary.lastPurchasePrice !== null ? formatCurrency(soldSummary.lastPurchasePrice) : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Sotish narxi</p>
                  <p className="text-base font-semibold text-green-600">{formatCurrency(selectedProduct.salePrice)}</p>
                </div>
              </div>

              <div className="px-6 -mt-2">
                <p className="text-xs text-gray-500">
                  Jami sotilgan: <span className="font-medium">{soldSummary.qty} ta</span>,
                  summa: <span className="font-medium">{formatCurrency(soldSummary.amount)}</span>,
                  {` ${soldSummary.times} marta`}
                </p>
              </div>

              <div className="p-6 pt-4">
                {historyLoading ? (
                    <div className="py-10 text-center text-gray-500">Yuklanmoqda…</div>
                ) : productHistory.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">Tarix mavjud emas</div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {productHistory.map(item => (
                          <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${item.kind === 'stock' ? 'bg-green-100' : 'bg-purple-100'}`}>
                                {item.kind === 'stock'
                                    ? <PackagePlus className="w-4 h-4 text-green-600" />
                                    : <ShoppingCart className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.kind === 'stock' ? "Omborga qo'shildi" : 'Sotildi'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.description || (item.kind === 'stock' ? "Omborga qo'shish" : 'Sotish')}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {item.date.toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${item.kind === 'stock' ? 'text-green-600' : 'text-purple-600'}`}>
                                {item.kind === 'stock' ? '+' : '-'}{item.quantity} ta
                              </p>
                              <p className="text-xs text-gray-500">{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>

              <div className="px-6 py-4 border-t flex justify-end">
                <button
                    onClick={() => { setShowHistoryModal(false); setSelectedProduct(null); }}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
      )}
    </>
  );
};

export default ProductManagement;