import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import ProductCard from '../../components/client/ProductCard';
import { useTranslation } from 'react-i18next';

const HomeClient = () => {
  const [produits, setProduits] = useState([]);
  const [erreur, setErreur] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProduits = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/api/produits');
        setProduits(res.data);
      } catch (err) {
        console.error(err);
        setErreur(t("erreurChargementProduits"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduits();
  }, [t]);

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />

      {/* Hero Section */}
      <div className="bg-amber-100 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            {t('titreAccueil')}
          </h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            {t('sloganAccueil')}
          </p>
        </div>
      </div>

      {/* Produits */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-amber-800 mb-6 text-center">
          {t('produits')}
        </h2>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{erreur}</p>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          /* Grille de produits */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produits.map((produit) => (
              <div key={produit.id} className="flex justify-center">
                <ProductCard produit={produit} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-amber-800 text-amber-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Boulangerie 🍞</h3>
              <p>{t('sloganFooter')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('horaires')}</h3>
              <p>{t('semaine')}: 7h - 19h</p>
              <p>{t('weekend')}: 7h - 13h</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-amber-700 text-center">
            <p>&copy; {new Date().getFullYear()} Boulangerie. {t('droitsReserves')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeClient;
