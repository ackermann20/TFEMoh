import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const HeaderClient = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Utilisateur');
  const [userSolde, setUserSolde] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setUserName('Utilisateur');
      return;
    }
  
    try {
      const decoded = jwtDecode(token)      ;
      const currentTime = Date.now() / 1000; // en secondes
      if (decoded.exp && decoded.exp < currentTime) {
        // Token expiré
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPrenom');
        setIsLoggedIn(false);
        setUserName('Utilisateur');
        return;
      }
  
      // Token valide
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

  // Fermer le menu déroulant si on clique ailleurs
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
          {/* Logo et nom */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <span className="text-3xl mr-2">🍞</span>
            <h1 className="text-2xl font-bold text-amber-800">Boulangerie</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="font-medium text-gray-700 hover:text-amber-600"
            >
              Accueil
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="font-medium text-gray-700 hover:text-amber-600"
            >
              Produits
            </button>
            
            <button
              onClick={() => navigate('/cart')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
            >
              Panier 🛒
            </button>
            
            {/* Affichage conditionnel selon l'état de connexion */}
            {isLoggedIn ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                >
                  <span>Bonjour {userName} </span>
                  <svg 
                    className={`ml-2 w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Menu déroulant du profil */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/profile');
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100"
                    >
                      <span className="mr-2">👤</span> Mon profil
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/orders');
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100"
                    >
                      <span className="mr-2">📋</span> Mes commandes
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/change-password');
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-100"
                    >
                      <span className="mr-2">🔒</span> Changer mot de passe
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      <span className="mr-2">🚪</span> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
              >
                Connexion
              </button>
            )}
          </nav>
          {isLoggedIn && (
            <span className="font-semibold text-amber-800">
              Solde : {userSolde.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderClient;