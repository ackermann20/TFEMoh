import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

const HeaderClient = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Utilisateur');
  const [userSolde, setUserSolde] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setUserName('Utilisateur');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPrenom');
        setIsLoggedIn(false);
        setUserName('Utilisateur');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserName(userData.prenom || 'Utilisateur');
      setUserSolde(userData.solde || 0);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserName('Utilisateur');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPrenom');
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false); // Fermer aussi le menu mobile
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar avec logo et controls */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200" 
            onClick={() => navigate('/')}
          > 
            <span className="text-4xl mr-3 drop-shadow-sm">🍞</span>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              Boulangerie
            </h1>
          </div>

          {/* Desktop controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language selector */}
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              defaultValue={i18n.language}
              className="border border-amber-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="fr"> Français </option>
              <option value="en"> English </option>
              <option value="nl"> Nederlands </option>
            </select>

            {/* Solde */}
            {isLoggedIn && (
              <div className="bg-white border border-amber-300 rounded-lg px-4 py-2 shadow-sm">
                <span className="font-semibold text-amber-800 text-sm">
                  💰 {userSolde.toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-2 pb-4">
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-100 transition-all duration-200"
          >
            🏠 {t('accueil')}
          </button>

          <button 
            onClick={() => navigate('/favoris')} 
            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-100 transition-all duration-200"
          >
            ❤️ {t('mesFavoris')}
          </button>
          <button 
            onClick={() => navigate('/contact')} 
            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-100 transition-all duration-200"
          >
            📩 {t('Contact')}
          </button>

          <button 
            onClick={() => navigate('/cart')} 
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🛒 {t('panier')}
          </button>

          {isLoggedIn ? (
            <div className="relative profile-dropdown">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <span className="mr-2">👋</span>
                <span>{t('bonjour')} {userName}</span>
                <svg 
                  className={`ml-2 w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200">
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }} 
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">👤</span> 
                    <span className="font-medium">{t('monProfil')}</span>
                  </button>
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate('/orders'); }} 
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">📋</span> 
                    <span className="font-medium">{t('mesCommandes')}</span>
                  </button>
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate('/change-password'); }} 
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">🔒</span> 
                    <span className="font-medium">{t('changerMotDePasse')}</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">🚪</span> 
                    <span className="font-medium">{t('deconnexion')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              🔑 {t('connexion')}
            </button>
          )}
        </nav>

        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[90vh] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>

          <div className="py-4 space-y-3 border-t border-amber-200">
            {/* Mobile controls */}
            <div className="flex flex-col sm:flex-row gap-3 pb-3 border-b border-amber-200">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
                className="border border-amber-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="fr"> Français </option>
                <option value="en"> English </option>
                <option value="nl"> Nederlands </option>
              </select>

              {isLoggedIn && (
                <div className="bg-white border border-amber-300 rounded-lg px-4 py-2 text-center">
                  <span className="font-semibold text-amber-800 text-sm">
                    💰 {t('solde')} : {userSolde.toFixed(2)} €
                  </span>
                </div>
              )}
            </div>

            {/* Mobile navigation - Navigation principale */}
            <button 
              onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} 
              className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">🏠</span> 
              <span className="font-medium">{t('accueil')}</span>
            </button>

            <button 
              onClick={() => { navigate('/favoris'); setIsMobileMenuOpen(false); }} 
              className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">❤️</span> 
              <span className="font-medium">{t('mesFavoris')}</span>
            </button>
            <button 
              onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }} 
              className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">📩</span> 
              <span className="font-medium">{t('contact')}</span>
            </button>

            <button 
               onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }} 
              className="flex items-center w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 rounded-lg font-medium shadow-lg"
            >
              <span className="mr-3 text-lg">🛒</span> 
              <span>{t('panier')}</span>
            </button>


            {/* Section profil utilisateur */}
            {isLoggedIn ? (
  <>
    <button 
      onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} 
      className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
    >
      <span className="mr-3 text-lg">👤</span> 
      <span className="font-medium">{t('monProfil')}</span>
    </button>

    <button 
      onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }} 
      className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
    >
      <span className="mr-3 text-lg">📋</span> 
      <span className="font-medium">{t('mesCommandes')}</span>
    </button>

    <button 
      onClick={handleLogout} 
      className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
    >
      <span className="mr-3 text-lg">🚪</span> 
      <span className="font-medium">{t('deconnexion')}</span>
    </button>
  </>
) : (
  <button 
    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} 
    className="flex items-center w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium shadow-lg"
  >
    <span className="mr-3 text-lg">🔑</span> 
    <span>{t('connexion')}</span>
  </button>
)}


          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderClient;