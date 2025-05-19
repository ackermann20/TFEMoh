import React, { useState } from 'react';
import axios from 'axios';

function ChangePasswordClient() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.post(
        'http://localhost:3000/api/auth/change-password',
        {
          userId: JSON.parse(localStorage.getItem('userData')).id,
          currentPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSuccess('Mot de passe changé avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        setError("Ancien mot de passe incorrect.");
      } else {
        setError("Erreur lors du changement de mot de passe.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-bold text-center text-orange-800 mb-4">Changer mon mot de passe</h2>
        {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Mot de passe actuel</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
            <p className="text-sm text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>
          <div className="mb-6">
            <label className="block font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setSuccess('');
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            >
              Modifier le mot de passe
            </button>
          </div>
        </form>
        <div className="mt-6 bg-orange-100 p-4 rounded text-sm text-orange-900">
          <h4 className="font-semibold">Conseils de sécurité</h4>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Utilisez un mot de passe unique pour chaque site</li>
            <li>Combinez lettres majuscules, minuscules, chiffres et caractères spéciaux</li>
            <li>Évitez d'utiliser des informations personnelles faciles à deviner</li>
            <li>Changez régulièrement votre mot de passe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordClient;
