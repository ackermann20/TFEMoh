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

      const prenom = localStorage.getItem('userPrenom');
      setUserName(prenom || 'Utilisateur');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
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
    <header className="bg-amber-50 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}> 
            <span className="text-3xl mr-2">🍞</span>
            <h1 className="text-2xl font-bold text-amber-800">Boulangerie</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="font-medium text-gray-700 hover:text-amber-600">
              {t('accueil')}
            </button>

            <button onClick={() => navigate('/favoris')} className="font-medium text-gray-700 hover:text-amber-600">
              {t('mesFavoris')}
            </button>

            <button onClick={() => navigate('/cart')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg">
              {t('panier')} 🛒
            </button>
            {isLoggedIn ? (
              <div className="relative profile-dropdown">
                <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg">
                  <span>{t('bonjour')} {userName}</span>
                  <svg className={`ml-2 w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                    <button onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }} className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100">
                      <span className="mr-2">👤</span> {t('monProfil')}
                    </button>
                    <button onClick={() => { setShowProfileDropdown(false); navigate('/orders'); }} className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100">
                      <span className="mr-2">📋</span> {t('mesCommandes')}
                    </button>
                    <button onClick={() => { setShowProfileDropdown(false); navigate('/change-password'); }} className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100">
                      <span className="mr-2">🔒</span> {t('changerMotDePasse')}
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">
                      <span className="mr-2">🚪</span> {t('deconnexion')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg">
                {t('connexion')}
              </button>
            )}
          </nav>

          <select onChange={(e) => i18n.changeLanguage(e.target.value)} defaultValue={i18n.language} className="ml-4 border rounded px-2 py-1 text-sm text-gray-700">
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="nl">NL</option>
          </select>

          {isLoggedIn && (
            <span className="font-semibold text-amber-800">
              {t('solde')} : {userSolde.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderClient;
