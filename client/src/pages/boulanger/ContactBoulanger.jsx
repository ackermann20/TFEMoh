import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger'; // si tu as un header boulanger

/**
 * Composant pour l'affichage et la gestion des messages de contact reçus par le boulanger
 * Permet de visualiser tous les messages clients et de répondre par email
 */
const ContactBoulanger = () => {
  // Hook de traduction pour l'internationalisation
  const { t } = useTranslation();
  
  // États locaux pour la gestion des données et de l'interface
  const [messages, setMessages] = useState([]); // Liste des messages de contact
  const [loading, setLoading] = useState(true); // État de chargement des données
  const [erreur, setErreur] = useState(false); // Gestion des erreurs de récupération

  /**
   * Effect hook pour charger les messages au montage du composant
   */
  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer les messages de contact depuis l'API
     */
    const fetchMessages = async () => {
      try {
        // Appel API pour récupérer tous les messages de contact
        // Utilise la variable d'environnement REACT_APP_API_URL ou localhost par défaut
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/contact`);
        
        // Mise à jour de l'état avec les messages récupérés
        setMessages(res.data);
      } catch (err) {
        // Log de l'erreur pour le debugging
        console.error('Erreur récupération messages :', err);
        
        // Activation du flag d'erreur pour affichage à l'utilisateur
        setErreur(true);
      } finally {
        // Désactivation du loading dans tous les cas (succès ou erreur)
        setLoading(false);
      }
    };

    // Exécution de la récupération des messages
    fetchMessages();
  }, []); // Tableau de dépendances vide = exécution uniquement au montage

  return (
    <div className="min-h-screen bg-amber-50">
      {/* En-tête spécifique au boulanger */}
      <HeaderBoulanger />

      {/* Conteneur principal avec largeur maximale et centrage */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Titre de la page avec emoji et traduction */}
        <h1 className="text-3xl font-bold mb-6 text-amber-800 text-center">
          📥 {t('messagesContact')}
        </h1>

        {/* Affichage conditionnel selon l'état de l'application */}
        
        {/* État de chargement */}
        {loading && <p>Chargement des messages...</p>}
        
        {/* État d'erreur */}
        {erreur && <p className="text-red-600">{t('erreurChargement')}</p>}
        
        {/* État : aucun message trouvé */}
        {!loading && !erreur && messages.length === 0 && (
          <p className="text-gray-600 text-center">{t('aucunMessage')}</p>
        )}

        {/* Grille d'affichage des messages */}
        <div className="grid gap-4">
          {messages.map((msg) => (
            // Carte individuelle pour chaque message
            <div key={msg.id} className="bg-white shadow-md rounded p-4">
              {/* En-tête du message avec date et bouton de réponse */}
              <div className="flex justify-between items-center mb-2">
                {/* Date de création formatée en français */}
                <span className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                
                {/* Bouton de réponse par email (mailto) */}
                <a
                  href={`mailto:${msg.email}`}
                  className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 text-sm"
                >
                  📧 {t('repondre')}
                </a>
              </div>
              
              {/* Informations de l'expéditeur */}
              <p className="font-bold">
                {msg.prenom} {msg.nom} ({msg.email})
              </p>
              
              {/* Numéro de téléphone (affiché seulement s'il existe) */}
              {msg.telephone && (
                <p className="text-gray-600 text-sm">
                  📞 {msg.telephone}
                </p>
              )}
              
              {/* Objet du message */}
              <p className="mt-2">
                <strong>Objet :</strong> {msg.objet}
              </p>
              
              {/* Corps du message avec préservation des retours à la ligne */}
              <p className="mt-1 whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactBoulanger;