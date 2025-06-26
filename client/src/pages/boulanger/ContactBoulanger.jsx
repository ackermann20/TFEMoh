import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger'; // si tu as un header boulanger

const ContactBoulanger = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/contact`);
        setMessages(res.data);
      } catch (err) {
        console.error('Erreur récupération messages :', err);
        setErreur(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderBoulanger />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800 text-center">📥 {t('messagesContact')}</h1>

        {loading && <p>Chargement des messages...</p>}
        {erreur && <p className="text-red-600">{t('erreurChargement')}</p>}
        {!loading && !erreur && messages.length === 0 && (
          <p className="text-gray-600 text-center">{t('aucunMessage')}</p>
        )}

        <div className="grid gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white shadow-md rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                <a
                  href={`mailto:${msg.email}`}
                  className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 text-sm"
                >
                  📧 {t('repondre')}
                </a>
              </div>
              <p className="font-bold">{msg.prenom} {msg.nom} ({msg.email})</p>
              {msg.telephone && <p className="text-gray-600 text-sm">📞 {msg.telephone}</p>}
              <p className="mt-2">
                <strong>Objet :</strong> {msg.objet}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactBoulanger;
