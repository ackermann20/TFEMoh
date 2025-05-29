import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeaderBoulanger = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.profile-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-3xl mr-2">🥖</span>
            <h1 className="text-2xl font-bold text-white">{t('espaceBoulanger')}</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <Link 
              to="/admin" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin') 
                  ? 'bg-amber-700 text-white' 
                  : 'text-white hover:bg-amber-600'
              }`}
            >
              {t('dashboard')}
            </Link>
            <Link 
              to="/admin/products" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/products') 
                  ? 'bg-amber-700 text-white' 
                  : 'text-white hover:bg-amber-600'
              }`}
            >
              {t('produits')}
            </Link>
            <Link 
              to="/admin/history" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/history') 
                  ? 'bg-amber-700 text-white' 
                  : 'text-white hover:bg-amber-600'
              }`}
            >
              {t('historique')}
            </Link>

            <div className="relative profile-menu ml-4">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <span className="font-medium">{user?.prenom || 'Boulanger'}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
                className="border rounded px-2 py-1 text-sm text-amber-900 bg-white"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
                <option value="nl">NL</option>
              </select>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                  <Link
                    to="/admin/profile"
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="mr-2">👤</span> {t('monProfil')}
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="mr-2">⚙️</span> {t('parametres')}
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userData');
                      window.location.href = '/login';
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    <span className="mr-2">🚪</span> {t('deconnexion')}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default HeaderBoulanger;
