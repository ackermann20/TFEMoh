import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, ChevronDown } from 'lucide-react';

const ProductFilter = ({ produits, onFilterChange, selectedTypes = [] }) => {
  const { t } = useTranslation();

  // Etat d'ouverture du panneau de filtre
  const [isOpen, setIsOpen] = useState(false);

  // Liste des types de produits disponibles
  const [productTypes, setProductTypes] = useState([]);

  // Types actuellement sélectionnés comme filtres
  const [activeFilters, setActiveFilters] = useState(selectedTypes);

  // Lors du montage ou quand la liste des produits change
  // On calcule la liste unique des types présents avec leur nombre d'occurrences
  useEffect(() => {
    if (!produits || produits.length === 0) return;

    const typeCounts = produits.reduce((acc, produit) => {
      const type = produit.type || 'autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const types = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      label: getTypeLabel(type)
    }));

    setProductTypes(types.sort((a, b) => a.label.localeCompare(b.label)));
  }, [produits]);

  /**
   * Retourne le libellé traduit pour un type donné
   */
  const getTypeLabel = (type) => {
    const typeLabels = {
      pain: t('typePain', 'Pain'),
      sandwich: t('typeSandwich', 'Sandwich'),
      viennoiserie: t('typeViennoiserie', 'Viennoiserie'),
      patisserie: t('typePatisserie', 'Pâtisserie'),
      boisson: t('typeBoisson', 'Boisson'),
      autre: t('typeAutre', 'Autre')
    };
    
    return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  /**
   * Retourne les couleurs de badge pour chaque type
   */
  const getTypeBadgeColor = (type) => {
    const colors = {
      pain: 'bg-amber-100 text-amber-800 border-amber-200',
      sandwich: 'bg-green-100 text-green-800 border-green-200',
      viennoiserie: 'bg-orange-100 text-orange-800 border-orange-200',
      patisserie: 'bg-rose-100 text-rose-800 border-rose-200',
      boisson: 'bg-blue-100 text-blue-800 border-blue-200',
      autre: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.autre;
  };

  /**
   * Retourne un emoji représentatif d'un type
   */
  const getTypeIcon = (type) => {
    switch (type) {
      case 'pain':
        return '🍞';
      case 'sandwich':
        return '🥪';
      case 'viennoiserie':
        return '🥐';
      case 'patisserie':
        return '🧁';
      case 'boisson':
        return '🥤';
      default:
        return '🍴';
    }
  };

  /**
   * Ajoute ou enlève un type des filtres actifs
   */
  const toggleType = (type) => {
    let newFilters;
    if (activeFilters.includes(type)) {
      newFilters = activeFilters.filter(t => t !== type);
    } else {
      newFilters = [...activeFilters, type];
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  /**
   * Vide tous les filtres
   */
  const clearAllFilters = () => {
    setActiveFilters([]);
    onFilterChange([]);
    setIsOpen(false);
  };

  /**
   * Active tous les types comme filtres
   */
  const selectAllTypes = () => {
    const allTypes = productTypes.map(pt => pt.type);
    setActiveFilters(allTypes);
    onFilterChange(allTypes);
  };

  return (
    <div className="relative">
      {/* Bouton principal du filtre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border-2 border-amber-300 rounded-xl px-4 py-3 hover:bg-amber-50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-700 whitespace-nowrap">
          {t('filtrerParType', 'Filtrer par type')}
        </span>
        {/* Badge indiquant le nombre de filtres actifs */}
        {activeFilters.length > 0 && (
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
            {activeFilters.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel déroulant des filtres */}
      {isOpen && (
        <>
          {/* Overlay semi-transparent pour fermer en cliquant à l’extérieur */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-6 z-50 w-96 max-w-[90vw] animate-fadeIn">
            {/* En-tête du panel */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">
                {t('categoriesProduits', 'Catégories de produits')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Boutons tout sélectionner / désélectionner */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={selectAllTypes}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors"
              >
                {t('toutSelectionner', 'Tout sélectionner')}
              </button>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                {t('toutDeselectionner', 'Tout désélectionner')}
              </button>
            </div>

            {/* Liste des types de produits */}
            <div className="grid grid-cols-2 gap-3">
              {productTypes.map(({ type, count, label }) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    activeFilters.includes(type)
                      ? `${getTypeBadgeColor(type)} border-current shadow-md`
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(type)}</span>
                    <span className="text-sm font-medium">
                      {label}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeFilters.includes(type)
                      ? 'bg-white bg-opacity-30'
                      : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Message si aucun produit */}
            {productTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('aucunProduitDisponible', 'Aucun produit disponible')}</p>
              </div>
            )}

            {/* Résumé des filtres actifs + bouton de reset */}
            {activeFilters.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {t('filtresActifs', 'Filtres actifs')} :
                  </span>
                  {activeFilters.map(type => (
                    <span
                      key={type}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTypeBadgeColor(type)}`}
                    >
                      <span>{getTypeIcon(type)}</span>
                      <span>{getTypeLabel(type)}</span>
                      <button
                        onClick={() => toggleType(type)}
                        className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('effacerTousFiltres', 'Effacer tous les filtres')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Animation fadeIn */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductFilter;
