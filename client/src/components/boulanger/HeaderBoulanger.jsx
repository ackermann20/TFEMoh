import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

const HeaderBoulanger = () => {
  // Hooks pour la navigation et la localisation actuelle dans React Router
  const navigate = useNavigate();
  const location = useLocation();

  // States pour gérer le nom de l'utilisateur connecté, son statut de connexion,
  // l'ouverture du menu profil et le menu mobile
  const [userName, setUserName] = useState('Boulanger');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hook pour la traduction
  const { t, i18n } = useTranslation();

  // Vérifie si l'utilisateur est connecté (token présent et valide)
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setUserName('Boulanger');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Si le token est expiré, déconnexion forcée
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setIsLoggedIn(false);
        setUserName('Boulanger');
        return;
      }

      // Récupération du prénom de l'utilisateur depuis le localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserName(userData.prenom || 'Boulanger');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserName('Boulanger');
    }
  };

  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
    window.location.reload();
  };

  // Vérifie si un chemin est celui actuellement actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Ferme le menu dropdown si on clique à l’extérieur
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

  // Vérifie le statut de connexion au montage du composant
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar avec logo et contrôles */}
        <div className="flex justify-between items-center py-4">
          {/* Logo cliquable vers l'accueil du boulanger */}
          <div 
            className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200" 
            onClick={() => navigate('/boulanger')}
          > 
            <span className="text-4xl mr-3 drop-shadow-sm">🥖</span>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              {t('espaceBoulanger', 'Espace Boulanger')}
            </h1>
          </div>

          {/* Contrôles desktop (sélecteur de langue) */}
          <div className="hidden lg:flex items-center gap-4">
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              defaultValue={i18n.language}
              className="border border-amber-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>

          {/* Bouton menu mobile visible uniquement sur petits écrans */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {/* Icone burger ou croix selon l’état du menu */}
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

        {/* Menu de navigation desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-2 pb-4">
          {/* Boutons de navigation vers différentes pages */}
          <button 
            onClick={() => navigate('/boulanger')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            📊 {t('dashboard.title', 'Tableau de bord')}
          </button>

          <button 
            onClick={() => navigate('/boulanger/products')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger/products')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            🍞 {t('products.title', 'Produits')}
          </button>

          <button 
            onClick={() => navigate('/boulanger/clients')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger/clients')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            👥 {t('clients.title', 'Clients')}
          </button>

          <button 
            onClick={() => navigate('/boulanger/horaires')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger/horaires')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            🕒 {t('horaires.title', 'Horaires d\'ouverture')}
          </button>

          <button 
            onClick={() => navigate('/boulanger/history')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger/history')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            📋 {t('historique', 'Historique')}
          </button>

          <button 
            onClick={() => navigate('/boulanger/messages')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive('/boulanger/messages')
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            📥 {t('messagesContact', 'Messages')}
          </button>

          {/* Dropdown profil si utilisateur connecté */}
          {isLoggedIn && (
            <div className="relative profile-dropdown ml-4">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <span className="mr-2">👨‍🍳</span>
                <span>{userName}</span>
                <svg 
                  className={`ml-2 w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu dropdown pour se déconnecter */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200">
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">🚪</span> 
                    <span className="font-medium">{t('deconnexion', 'Déconnexion')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Menu mobile (affiché sur petits écrans) */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[90vh] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
          <div className="py-4 space-y-3 border-t border-amber-200">
            {/* Contrôles mobile : sélecteur de langue */}
            <div className="flex flex-col gap-3 pb-3 border-b border-amber-200">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
                className="border border-amber-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>

            {/* Navigation mobile */}
            <button 
              onClick={() => { navigate('/boulanger'); setIsMobileMenuOpen(false); }} 
              className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive('/boulanger')
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
              }`}
            >
              <span className="mr-3 text-lg">📊</span> 
              <span className="font-medium">{t('dashboard.title', 'Tableau de bord')}</span>
            </button>

            <button 
              onClick={() => { navigate('/boulanger/products'); setIsMobileMenuOpen(false); }} 
              className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive('/boulanger/products')
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
              }`}
            >
              <span className="mr-3 text-lg">🍞</span> 
              <span className="font-medium">{t('products.title', 'Produits')}</span>
            </button>

            <button 
              onClick={() => { navigate('/boulanger/clients'); setIsMobileMenuOpen(false); }} 
              className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive('/boulanger/clients')
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
              }`}
            >
              <span className="mr-3 text-lg">👥</span> 
              <span className="font-medium">{t('clients.title', 'Clients')}</span>
            </button>

            <button 
              onClick={() => { navigate('/boulanger/horaires'); setIsMobileMenuOpen(false); }} 
              className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive('/boulanger/horaires')
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
              }`}
            >
              <span className="mr-3 text-lg">🕒</span> 
              <span className="font-medium">{t('horaires.title', 'Horaires d\'ouverture')}</span>
            </button>

            <button 
              onClick={() => { navigate('/boulanger/history'); setIsMobileMenuOpen(false); }} 
              className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive('/boulanger/history')
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
              }`}
            >
              <span className="mr-3 text-lg">📋</span> 
              <span className="font-medium">{t('historique', 'Historique')}</span>
            </button>

            <button 
              onClick={() => { navigate('/boulanger/messages'); setIsMobileMenuOpen(false); }} 
              className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">📥</span> 
              <span className="font-medium">{t('messagesContact')}</span>
            </button>

            {/* Section profil et déconnexion en mobile */}
            {isLoggedIn && (
              <div className="space-y-2 border-t border-amber-200 pt-3">
                <div className="px-4 py-2 bg-amber-100 rounded-lg">
                  <span className="font-semibold text-amber-800">
                    👨‍🍳 {userName}
                  </span>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
                >
                  <span className="mr-3 text-lg">🚪</span> 
                  <span className="font-medium">{t('deconnexion', 'Déconnexion')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBoulanger;
