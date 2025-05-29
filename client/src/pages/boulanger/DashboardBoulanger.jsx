import React, { useEffect, useState } from 'react';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const DashboardBoulanger = () => {
  const { t } = useTranslation();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const formaterPlageHoraire = (tranche) => {
    switch (tranche) {
      case 'matin':
        return '7h - 11h';
      case 'midi':
        return '12h - 14h';
      case 'soir':
        return '14h - 19h';
      default:
        return tranche;
    }
  };

  const getStatutBadgeClass = (statut) => {
    switch (statut) {
      case 'en attente':
        return 'bg-yellow-200 text-yellow-800';
      case 'en préparation':
        return 'bg-blue-200 text-blue-800';
      case 'prêt':
        return 'bg-green-200 text-green-800';
      case 'annulé':
        return 'bg-red-200 text-red-800';
      case 'livré':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleStatutUpdate = async (commandeId, nouveauStatut) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/api/boulanger/commandes/${commandeId}/statut`, {
        statut: nouveauStatut
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCommandes(prev =>
        prev.map(cmd =>
          cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
        )
      );
      showNotification(`Commande #${commandeId} mise à jour avec succès!`, 'success');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      showNotification("Impossible de mettre à jour la commande.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    alert(message);
  };

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/boulanger/commandes-aujourdhui", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommandes(res.data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
        setError("Impossible de charger les commandes. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, []);

  const commandesFiltrees = commandes
    .filter(cmd => filtreStatut === 'tous' || cmd.statut === filtreStatut)
    .filter(cmd => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      const prenom = (cmd.utilisateur?.prenom || '').toLowerCase();
      const nom = (cmd.utilisateur?.nom || '').toLowerCase();
      const nomComplet = `${prenom} ${nom}`.toLowerCase();
      return prenom.includes(searchLower) || 
             nom.includes(searchLower) || 
             nomComplet.includes(searchLower) ||
             String(cmd.id).includes(searchLower);
    });

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderBoulanger />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-amber-900">{t('bakerDashboard.title')}</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('bakerDashboard.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearching(true);
                  }}
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                />
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearching(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <label htmlFor="statut-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {t('bakerDashboard.filterByStatus')}
                </label>
                <select
                  id="statut-filter"
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 w-full md:w-auto"
                >
                  <option value="tous">{t('bakerDashboard.status.all')}</option>
                  <option value="en attente">{t('bakerDashboard.status.pending')}</option>
                  <option value="en préparation">{t('bakerDashboard.status.preparing')}</option>
                  <option value="prêt">{t('bakerDashboard.status.ready')}</option>
                  <option value="livré">{t('bakerDashboard.status.delivered')}</option>
                  <option value="annulé">{t('bakerDashboard.status.cancelled')}</option>

                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : commandesFiltrees.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-md text-center">
              <p className="text-gray-600">
                {isSearching 
                  ? `Aucun résultat trouvé pour "${searchTerm}" ${filtreStatut !== 'tous' ? `avec le statut "${filtreStatut}"` : ''}`
                  : `Aucune commande ${filtreStatut !== 'tous' ? `au statut "${filtreStatut}"` : ''} pour aujourd'hui.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commandesFiltrees.map((cmd) => (
                <div 
                  key={cmd.id} 
                  className="bg-white rounded-lg shadow-md border border-amber-100 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* En-tête de la commande */}
                  <div className="bg-amber-100 p-4 border-b border-amber-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-amber-900">Commande #{cmd.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadgeClass(cmd.statut)}`}>
                        {cmd.statut}
                      </span>
                    </div>
                    <p className="text-sm text-amber-800 mt-1">
                      Client: {cmd.utilisateur?.prenom || 'inconnu'}
                    </p>
                  </div>
                  
                                      {/* Détails de la commande */}
                  <div className="p-4">
                    <div className="flex justify-between mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Commandée le:</p>
                        <p className="font-medium">{new Date(cmd.dateCommande).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Retrait prévu:</p>
                        <p className="font-medium">{new Date(cmd.dateRetrait).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-amber-600 font-medium">{formaterPlageHoraire(cmd.trancheHoraireRetrait)}</p>
                      </div>
                    </div>

                    {/* Client info */}
                    {cmd.utilisateur && (
                      <div className="my-3 p-2 bg-amber-50 rounded-md">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Client:</h4>
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">{cmd.utilisateur.prenom} {cmd.utilisateur.nom}</span>
                            {cmd.utilisateur.telephone && (
                              <a href={`tel:${cmd.utilisateur.telephone}`} className="ml-2 text-blue-600 hover:underline">
                                {cmd.utilisateur.telephone}
                              </a>
                            )}
                          </p>
                          {cmd.utilisateur.email && (
                            <p className="text-xs text-gray-600 truncate">
                              {cmd.utilisateur.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Liste des produits */}
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Produits:</h4>
                      <ul className="space-y-2 mb-4">
                        {cmd.Produits.map((prod, i) => (
                          <li key={i} className="text-sm border-b border-gray-100 pb-2">
                            <div className="flex justify-between">
                              <span><strong>{prod.quantite} x {prod.nom}</strong></span>
                              <span className="text-gray-600">{prod.prix} €</span>
                            </div>

                            {prod.garnitures && prod.garnitures.length > 0 && (
                              <ul className="ml-4 text-xs text-gray-500 mt-1">
                                {prod.garnitures.map((g, j) => (
                                  <li key={j} className="flex justify-between">
                                    <span>+ {g.nom}</span>
                                    <span>{g.prix} €</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Total et boutons */}
                    <div className="mt-4 pt-3 border-t border-amber-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg text-amber-900">{cmd.prixTotal.toFixed(2)} €</span>
                      </div>
                      
                      {cmd.statut === 'en attente' && (
                        <div className="flex justify-between gap-3">
                          <button
                            onClick={() => handleStatutUpdate(cmd.id, 'en préparation')}
                            className="w-1/2 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex justify-center items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Accepter
                          </button>
                          <button
                            onClick={() => handleStatutUpdate(cmd.id, 'annulé')}
                            className="w-1/2 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex justify-center items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Refuser
                          </button>
                        </div>
                      )}
                      
                      {cmd.statut === 'en préparation' && (
                        <button
                          onClick={() => handleStatutUpdate(cmd.id, 'prêt')}
                          className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Marquer comme prêt
                        </button>
                      )}
                      
                      {cmd.statut === 'prêt' && (
                        <button
                          onClick={() => handleStatutUpdate(cmd.id, 'livré')}
                          className="w-full py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Marquer comme livré
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardBoulanger;