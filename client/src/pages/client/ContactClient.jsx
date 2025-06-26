import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import { useTranslation } from 'react-i18next';

const ContactClient = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    objet: '',
    message: ''
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setFormData(prev => ({
        ...prev,
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        email: userData.email || '',
        telephone: userData.telephone || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/contact`, {
        ...formData,
        utilisateurId: JSON.parse(localStorage.getItem('userData') || '{}')?.id || null
      });

      setSuccess(true);
      setError('');
      setFormData({ nom: '', prenom: '', email: '', telephone: '', objet: '', message: '' });
    } catch (err) {
      console.error(err);
      setError(t('erreurMessage'));
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded mt-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800 text-center">📩 {t('contact')}</h1>

        {success && (
          <div className="mb-4 text-green-600 font-medium">{t('messageEnvoye')}</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder={t('prenom')}
              required
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder={t('nom')}
              required
              className="w-1/2 p-2 border rounded"
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('email')}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder={t('telephone')}
            className="w-full p-2 border rounded"
          />

          <select
            name="objet"
            value={formData.objet}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">{t('objet')}</option>
            <option value="Demande d'infos / Devis">{t('objet.demande')}</option>
            <option value="Réclamation / Plainte">{t('objet.plainte')}</option>
            <option value="Autres">{t('objet.autres')}</option>

          </select>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t('message')}
            required
            className="w-full p-2 border rounded min-h-[120px]"
          />

          <button
            type="submit"
            className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition"
          >
            {t('envoyer')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactClient;
