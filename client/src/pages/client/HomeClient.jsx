import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import ProductCard from '../../components/client/ProductCard';
import ProductFilter from '../../components/client/ProductFilter';
import { useTranslation } from 'react-i18next';

const HomeClient = () => {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [erreur, setErreur] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProduits = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/produits`);
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

  useEffect(() => {
    let filtered = produits;

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(produit =>
        selectedTypes.includes(produit.type || 'autre')
      );
    }

    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(produit =>
        (produit.nom || '').toLowerCase().includes(lower) ||
        (produit.description || '').toLowerCase().includes(lower)
      );
    }

    setFilteredProduits(filtered);
  }, [produits, selectedTypes, searchTerm]);

  const handleFilterChange = (newSelectedTypes) => {
    setSelectedTypes(newSelectedTypes);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

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
        <h2 className="text-3xl font-bold text-amber-800 mb-8 text-center">
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
          <>
            {/* Barre de filtres et recherche simplifiée et alignée */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-200">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                
                {/* Section Filtres */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                    {t('filtres', 'Filtres')} :
                  </span>
                  <ProductFilter
                    produits={produits}
                    onFilterChange={handleFilterChange}
                    selectedTypes={selectedTypes}
                  />
                </div>

                {/* Séparateur vertical pour desktop */}
                <div className="hidden lg:block w-px h-12 bg-gray-300"></div>

                {/* Section Recherche */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">🔎</span>
                  <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                    {t('recherche', 'Recherche')} :
                  </span>
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('rechercherProduit', 'Rechercher un produit...')}
                      className="w-full pl-4 pr-10 py-3 border-2 border-amber-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-amber-50/50"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('effacerRecherche', 'Effacer la recherche')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Résultats */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-100 px-4 py-2 rounded-lg whitespace-nowrap">
                  <span className="text-lg">📊</span>
                  <span className="font-medium">
                    {t('produitsTrouves', { count: filteredProduits.length })}

                  </span>
                </div>
              </div>

              {/* Filtres actifs */}
              {(selectedTypes.length > 0 || searchTerm) && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {t('filtresActifs', 'Filtres actifs')} :
                    </span>
                    
                    {/* Types sélectionnés */}
                    {selectedTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {t(`type${type.charAt(0).toUpperCase() + type.slice(1)}`, type)}
                        <button
                          onClick={() => handleFilterChange(selectedTypes.filter(t => t !== type))}
                          className="ml-1 hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {/* Terme de recherche */}
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        "{searchTerm}"
                        <button
                          onClick={clearSearch}
                          className="ml-1 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Bouton tout effacer */}
                    <button
                      onClick={() => {
                        handleFilterChange([]);
                        setSearchTerm('');
                      }}
                      className="ml-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                    >
                      {t('toutEffacer', 'Tout effacer')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grille de produits filtrés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProduits.map((produit) => (
                <div key={produit.id} className="flex justify-center">
                  <ProductCard produit={produit} />
                </div>
              ))}
            </div>

            {/* Message si aucun produit */}
            {filteredProduits.length === 0 && produits.length > 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  {t('aucunResultat', 'Aucun résultat trouvé')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {t('aucunProduitCorrespondFiltre', 'Aucun produit ne correspond à vos critères de recherche.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      handleFilterChange([]);
                      setSearchTerm('');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {t('effacerTousFiltres', 'Effacer tous les filtres')}
                  </button>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200"
                  >
                    {t('effacerRecherche', 'Effacer la recherche')}
                  </button>
                </div>
              </div>
            )}
          </>
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
              <h3 className="text-lg font-semibold mb-2">{t('horairesFooter')}</h3>
              <p>{t('semaine')}: 7h - 20h</p>
              <p>{t('weekend')}: 7h - 19h</p>
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