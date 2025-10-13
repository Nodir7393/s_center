import React from 'react';
import { Users, DollarSign, TrendingUp, Settings, Menu, X, PieChart, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'clients', label: 'Mijozlar', icon: Users },
    // { id: 'debts', label: 'Qarzlar', icon: CreditCard },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'expenses', label: 'Xarajatlar', icon: DollarSign },
    { id: 'profits', label: 'Oylik Foyda', icon: PieChart },
    { id: 'settings', label: 'Sozlamalar', icon: Settings }
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
              src="/logo.png"
              alt="Steam Center Logo"
              className="w-12 h-12 object-contain"
          />
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 bg-clip-text text-transparent">Steam Center</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center space-x-2">
                <img
                    src="/logo.png"
                    alt="Steam Center Logo"
                    className="w-20 h-20 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 bg-clip-text text-transparent">Steam Center</h1>
                  {user && (
                    <p className="text-xs text-gray-500">{user.telegram}</p>
                  )}
                </div>
              </div>
            </div>
            <nav className="mt-6 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center px-6 py-4 text-left hover:bg-purple-50 transition-colors ${
                      currentPage === item.id
                        ? 'bg-purple-100 text-purple-700 border-r-4 border-purple-600'
                        : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile Logout Button */}
            <div className="p-6 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg h-screen flex flex-col sticky top-0 self-start">
          <div className="pt-6">
            <div className="flex items-center">
              <img
                  src="/logo.png"
                  alt="Steam Center Logo"
                  className="w-20 h-20 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 bg-clip-text text-transparent">Steam Center</h1>
                {user && (
                  <p className="text-xs text-gray-500">{user.telegram}</p>
                )}
              </div>
            </div>
          </div>
          <nav className="mt-6 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-purple-50 transition-colors ${
                    currentPage === item.id
                      ? 'bg-purple-100 text-purple-700 border-r-4 border-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* Desktop Logout Button */}
          <div className="p-6 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Chiqish
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;