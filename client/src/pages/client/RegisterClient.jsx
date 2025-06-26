import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const RegisterClient = () => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [validations, setValidations] = useState({});
  const [telephone, setTelephone] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const validatePassword = (password) => {
    return {
      longueur: password.length >= 8,
      majuscule: /[A-Z]/.test(password),
      minuscule: /[a-z]/.test(password),
      chiffre: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  };

const isEmailValid = (email) => /^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    const validation = validatePassword(motDePasse);
    setValidations(validation);

    if (!isEmailValid(email)) {
      setErreur(t('emailInvalide'));
      return;
    }

    if (motDePasse !== confirmation) {
      setErreur(t('motDePasseNonCorrespondant'));

      return;
    }

    if (Object.values(validation).includes(false)) {
      setErreur(t('motDePasseTropFaible'));
      return;
    }
    if (telephone.length < 9) {
      setErreur(t('telephoneInvalide'));
      return;
    }


    try {
      const res = await axios.post(`${API_BASE_URL}/api/utilisateurs`, {
        prenom, nom, email, motDePasse,telephone
      });

      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userData', JSON.stringify(res.data.user));
        navigate('/');
        window.location.reload();
      } else {
        setErreur(t('erreurCreationCompte'));
      }
    } catch (err) {
      setErreur(err.response?.data?.message || t('erreurCreationCompte'));
    }
  };

  const validation = validatePassword(motDePasse);

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">{t('creerCompte')}</h2>
        {erreur && <div className="text-red-600 mb-4">{erreur}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">{t('prenom')}</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700">{t('nom')}</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700">{t('email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700">{t('telephone')}</label>
            <PhoneInput
              country={'be'}
              value={telephone}
              onChange={setTelephone}
              inputStyle={{ width: '100%' }}
              inputProps={{
                name: 'telephone',
                required: true,
                autoFocus: false
              }}
              enableSearch
            />
          </div>

          <div>
            <label className="block text-gray-700">{t('motDePasse')}</label>
            <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
            <ul className="text-sm mt-1 ml-2 text-gray-600 list-disc">
              <li className={validation.longueur ? 'text-green-600' : 'text-red-500'}>{t('motDePasseLongueur')}</li>
              <li className={validation.majuscule ? 'text-green-600' : 'text-red-500'}>{t('motDePasseMajuscule')}</li>
              <li className={validation.minuscule ? 'text-green-600' : 'text-red-500'}>{t('motDePasseMinuscule')}</li>
              <li className={validation.chiffre ? 'text-green-600' : 'text-red-500'}>{t('motDePasseChiffre')}</li>
              <li className={validation.special ? 'text-green-600' : 'text-red-500'}>{t('motDePasseSpecial')}</li>

            </ul>
          </div>
          <div>
            <label className="block text-gray-700">{t('confirmerMotDePasse')}</label>
            <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded">
            {t('sInscrire')}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-gray-600">{t('dejaUnCompte')} </span>
          <button onClick={() => navigate('/login')} className="text-amber-700 font-medium hover:underline">{t('connexion')}</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;