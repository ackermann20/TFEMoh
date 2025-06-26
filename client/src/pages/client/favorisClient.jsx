
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/client/ProductCard';
import { useTranslation } from 'react-i18next';
import Header from '../../components/client/HeaderClient';

const FavorisClient = () => {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchFavoris = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const userId = JSON.parse(localStorage.getItem("userData"))?.id;
        const res = await axios.get('http://localhost:3000/api/favoris/mes', {
        headers: {
            Authorization: `Bearer ${token}`,
            userid: userId
        }
        });

        setFavoris(res.data);

      setError(null);
    } catch (err) {
      setError(t('erreurChargementFavoris'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoris();

    const handleFavorisUpdate = () => {
      fetchFavoris();
    };

    window.addEventListener('favorisUpdated', handleFavorisUpdate);

    return () => {
      window.removeEventListener('favorisUpdated', handleFavorisUpdate);
    };
  }, [navigate, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-amber-800 text-lg">{t('chargement')}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('erreur')}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {t('réessayer')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header />
      <div className="bg-amber-100 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            {t('mesFavoris')}
          </h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            {favoris.length > 0 
              ? t('découvrezVosFavoris', { count: favoris.length })
              : t('vousNAvezPasEncoreDeFavoris')
            }
          </p>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {favoris.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('aucunFavori')}</h3>
              <p className="text-gray-600 mb-8">{t('commencezAjouterFavoris')}</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t('découvrirProduits')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {favoris.length} {favoris.length === 1 ? t('produitFavori') : t('produitsFavoris')}
                    </h3>
                    <p className="text-gray-600">{t('vosProduitsPreféres')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
                >
                  {t('ajouterPlus')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favoris.map((item) => (
                <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
                  <ProductCard produit={item.produit} showFavori={true} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavorisClient;
