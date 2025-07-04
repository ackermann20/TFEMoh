import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import { Search, Users, Plus, Euro, Calendar, Phone, Mail, User, CreditCard } from 'lucide-react';

/**
 * Composant principal pour la gestion des clients par le boulanger
 * Permet de visualiser la liste des clients, leurs informations et d'ajouter du solde
 */
const ClientsBoulanger = () => {
  // Hook de traduction pour l'internationalisation
  const { t } = useTranslation();
  
  // États locaux pour la gestion des données et de l'interface
  const [clients, setClients] = useState([]); // Liste des clients
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Gestion des erreurs
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [showAddSoldeModal, setShowAddSoldeModal] = useState(false); // Affichage du modal d'ajout de solde
  const [selectedClient, setSelectedClient] = useState(null); // Client sélectionné pour l'ajout de solde
  const [montantAjouter, setMontantAjouter] = useState(''); // Montant à ajouter au solde
  const [raisonAjout, setRaisonAjout] = useState(''); // Raison de l'ajout de solde
  const [isAdding, setIsAdding] = useState(false); // État de traitement de l'ajout

  // Configuration de l'URL de l'API avec fallback sur localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // Effet pour charger les clients au montage du composant
  useEffect(() => {
    fetchClients();
  }, []);

  /**
   * Fonction pour récupérer la liste des clients depuis l'API
   */
  const fetchClients = async () => {
    try {
      setLoading(true);
      // Récupération du token d'authentification depuis le localStorage
      const token = localStorage.getItem("token");
      
      // Appel API pour récupérer les clients avec authentification
      const res = await axios.get(`${API_BASE_URL}/api/boulanger/clients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClients(res.data);
      setError(null);
    } catch (error) {
      console.error("Erreur fetch clients:", error);
      setError(t('clients.errors.loadFailed', 'Impossible de charger les clients. Veuillez réessayer plus tard.'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour ajouter du solde à un client
   */
  const handleAddSolde = async () => {
    // Validation du montant saisi
    if (!montantAjouter || parseFloat(montantAjouter) <= 0) {
      showNotification(t('clients.errors.invalidAmount', 'Veuillez saisir un montant valide.'), 'error');
      return;
    }

    try {
      setIsAdding(true);
      const token = localStorage.getItem("token");
      
      // Appel API pour ajouter du solde au client sélectionné
      await axios.put(`${API_BASE_URL}/api/boulanger/clients/${selectedClient.id}/add-solde`, {
        montant: parseFloat(montantAjouter),
        raison: raisonAjout
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mise à jour locale du solde du client dans la liste
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === selectedClient.id 
            ? { ...client, solde: client.solde + parseFloat(montantAjouter) }
            : client
        )
      );

      // Affichage de la notification de succès
      showNotification(
        t('clients.notifications.soldeAdded', 'Solde de {{amount}}€ ajouté avec succès à {{name}}', {
          amount: montantAjouter,
          name: `${selectedClient.prenom} ${selectedClient.nom}`
        })
      );

      // Fermeture du modal et réinitialisation des champs
      setShowAddSoldeModal(false);
      setSelectedClient(null);
      setMontantAjouter('');
      setRaisonAjout('');
    } catch (error) {
      console.error("Erreur ajout solde:", error);
      showNotification(t('clients.errors.addSoldeFailed', 'Erreur lors de l\'ajout du solde.'), 'error');
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Ouvre le modal d'ajout de solde pour un client donné
   * @param {Object} client - Le client pour lequel ajouter du solde
   */
  const openAddSoldeModal = (client) => {
    setSelectedClient(client);
    setShowAddSoldeModal(true);
  };

  /**
   * Ferme le modal d'ajout de solde et réinitialise les champs
   */
  const closeAddSoldeModal = () => {
    setShowAddSoldeModal(false);
    setSelectedClient(null);
    setMontantAjouter('');
    setRaisonAjout('');
  };

  /**
   * Affiche une notification temporaire à l'utilisateur
   * @param {string} message - Le message à afficher
   * @param {string} type - Le type de notification ('success' ou 'error')
   */
  const showNotification = (message, type = 'success') => {
    // Création dynamique d'un élément de notification
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700';
    const icon = type === 'error' 
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';

    // Configuration du style et du contenu de la notification
    notification.className = `fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-md z-50 transform translate-x-full opacity-0 transition-all duration-300`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
        ${message}
      </div>
    `;
    
    // Ajout et animation de la notification
    document.body.appendChild(notification);
    setTimeout(() => { notification.classList.remove('translate-x-full', 'opacity-0'); }, 10);
    setTimeout(() => { 
      notification.classList.add('translate-x-full', 'opacity-0'); 
      setTimeout(() => notification.remove(), 300); 
    }, 4000);
  };

  /**
   * Filtre la liste des clients selon le terme de recherche
   * Recherche dans le nom, prénom, email et téléphone
   */
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      client.prenom.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.telephone && client.telephone.includes(searchTerm))
    );
  });

  /**
   * Formate une date au format français
   * @param {string} dateString - La date à formater
   * @returns {string} La date formatée
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Calcule les statistiques des clients
   * @returns {Object} Objet contenant les statistiques
   */
  const getStatsClients = () => {
    return {
      total: clients.length,
      soldeTotal: clients.reduce((sum, client) => sum + client.solde, 0),
      clientsAvecSolde: clients.filter(client => client.solde > 0).length
    };
  };

  // Calcul des statistiques pour l'affichage
  const stats = getStatsClients();

  /**
   * Composant pour l'affichage mobile des clients sous forme de cartes
   * @param {Object} props - Les props du composant
   * @param {Object} props.client - Les données du client à afficher
   */
  const ClientCard = ({ client }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-amber-500">
      {/* En-tête de la carte avec nom et solde */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{client.prenom} {client.nom}</h3>
            <p className="text-xs text-gray-500">ID: {client.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          client.solde > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {client.solde.toFixed(2)} €
        </div>
      </div>
      
      {/* Informations de contact */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{client.email}</span>
        </div>
        {client.telephone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            {client.telephone}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {formatDate(client.createdAt)}
        </div>
      </div>
      
      {/* Bouton d'ajout de solde */}
      <button
        onClick={() => openAddSoldeModal(client)}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t('clients.addBalance', 'Ajouter solde')}</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* En-tête de la page */}
      <HeaderBoulanger />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section en-tête avec titre et statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            {/* Titre et sous-titre */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-amber-800 mb-2">
                {t('clients.title', 'Gestion des Clients')}
              </h1>
              <p className="text-gray-600">
                {t('clients.subtitle', 'Gérez vos clients et leurs soldes')}
              </p>
            </div>
            
            {/* Statistiques rapides */}
            <div className="mt-4 lg:mt-0 grid grid-cols-3 lg:grid-cols-3 gap-2 lg:gap-4 w-full lg:w-auto">
              {/* Nombre total de clients */}
              <div className="bg-amber-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-amber-600">{stats.total}</div>
                <div className="text-xs text-gray-600">{t('clients.stats.totalClients', 'Total clients')}</div>
              </div>
              {/* Clients avec solde positif */}
              <div className="bg-green-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-green-600">{stats.clientsAvecSolde}</div>
                <div className="text-xs text-gray-600">{t('clients.stats.withBalance', 'Avec solde')}</div>
              </div>
              {/* Solde total de tous les clients */}
              <div className="bg-blue-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-blue-600">{stats.soldeTotal.toFixed(2)}€</div>
                <div className="text-xs text-gray-600">{t('clients.stats.totalBalance', 'Solde total')}</div>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="w-full lg:max-w-md">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 mr-2 text-amber-500" />
              {t('clients.search', 'Rechercher un client')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('clients.searchPlaceholder', 'Nom, prénom, email ou téléphone...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {/* Bouton pour effacer la recherche */}
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal - Gestion des différents états */}
        {loading ? (
          // État de chargement
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('clients.loading', 'Chargement des clients...')}</p>
            </div>
          </div>
        ) : error ? (
          // État d'erreur
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t('clients.retry', 'Réessayer')}
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          // Aucun client trouvé
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 
                t('clients.noSearchResults', 'Aucun client trouvé pour "{{term}}"', { term: searchTerm }) :
                t('clients.noClients', 'Aucun client enregistré')
              }
            </h3>
          </div>
        ) : (
          <>
            {/* Affichage mobile - Cartes */}
            <div className="block lg:hidden">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>

            {/* Affichage desktop - Tableau */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* En-tête du tableau */}
                  <thead className="bg-amber-50 border-b border-amber-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('clients.table.client', 'Client')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('clients.table.contact', 'Contact')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('clients.table.balance', 'Solde')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('clients.table.joinDate', 'Inscription')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('clients.table.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  {/* Corps du tableau */}
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-200">
                        {/* Colonne client (nom, prénom, ID) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-amber-100 rounded-full p-2 mr-3">
                              <User className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.prenom} {client.nom}
                              </div>
                              <div className="text-sm text-gray-500">ID: {client.id}</div>
                            </div>
                          </div>
                        </td>
                        {/* Colonne contact (email, téléphone) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {client.email}
                            </div>
                            {client.telephone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {client.telephone}
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Colonne solde */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            client.solde > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.solde.toFixed(2)} €
                          </div>
                        </td>
                        {/* Colonne date d'inscription */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(client.createdAt)}
                          </div>
                        </td>
                        {/* Colonne actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openAddSoldeModal(client)}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t('clients.addBalance', 'Ajouter solde')}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal d'ajout de solde */}
        {showAddSoldeModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
              {/* En-tête du modal */}
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('clients.addBalanceTitle', 'Ajouter du solde')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedClient.prenom} {selectedClient.nom}
                  </p>
                </div>
              </div>

              {/* Formulaire d'ajout de solde */}
              <div className="space-y-4">
                {/* Affichage du solde actuel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.currentBalance', 'Solde actuel')}
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-lg font-semibold text-gray-800">
                      {selectedClient.solde.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Champ de saisie du montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.amountToAdd', 'Montant à ajouter')} (€)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={montantAjouter}
                    onChange={(e) => setMontantAjouter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="10.00"
                  />
                </div>

                {/* Champ de saisie de la raison (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.reason', 'Raison')} ({t('clients.optional', 'optionnel')})
                  </label>
                  <input
                    type="text"
                    value={raisonAjout}
                    onChange={(e) => setRaisonAjout(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('clients.reasonPlaceholder', 'Ex: Remboursement, Cadeau...')}
                  />
                </div>

                {/* Aperçu du nouveau solde */}
                {montantAjouter && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>{t('clients.newBalance', 'Nouveau solde')} :</strong> {(selectedClient.solde + parseFloat(montantAjouter || 0)).toFixed(2)} €
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons d'action du modal */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {/* Bouton d'annulation */}
                <button
                  onClick={closeAddSoldeModal}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  {t('clients.cancel', 'Annuler')}
                </button>
                {/* Bouton de confirmation */}
                <button
                  onClick={handleAddSolde}
                  disabled={isAdding || !montantAjouter || parseFloat(montantAjouter) <= 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    // État de chargement lors de l'ajout
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('clients.adding', 'Ajout...')}
                    </div>
                  ) : (
                    // État normal
                    <div className="flex items-center justify-center">
                      <Euro className="w-4 h-4 mr-2" />
                      {t('clients.confirm', 'Confirmer')}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientsBoulanger;