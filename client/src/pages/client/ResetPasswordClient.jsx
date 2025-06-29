import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ResetPasswordClient() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  // États locaux :
  const [password, setPassword] = useState("");                // Nouveau mot de passe
  const [confirmPassword, setConfirmPassword] = useState("");  // Confirmation du mot de passe
  const [message, setMessage] = useState(null);                // Message de succès
  const [error, setError] = useState(null);                    // Message d'erreur

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * Vérifie la force du mot de passe
   */
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return t('changePassword.error.minLength') || "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!hasUpperCase) {
      return t('changePassword.error.uppercase') || "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!hasLowerCase) {
      return t('changePassword.error.lowercase') || "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!hasNumbers) {
      return t('changePassword.error.number') || "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!hasSpecialChar) {
      return t('changePassword.error.special') || "Le mot de passe doit contenir au moins un caractère spécial";
    }
    return null;
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validation du mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("changePassword.error.mismatch"));
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        password
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t("erreur"));
    }
  };

  /**
   * Annule le processus de réinitialisation
   */
  const handleCancel = () => {
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold text-center text-orange-800 mb-4">
          {t("reinitialiserMotDePasse")}
        </h1>

        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-2">
              {t("nouveauMotDePasse")}
            </label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={t("nouveauMotDePasse")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("changePassword.rules")}
            </p>
          </div>

          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              {t("changePassword.confirm")}
            </label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={t("changePassword.confirm")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              {t("changePassword.cancel") || "Annuler"}
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            >
              {t("reinitialiser")}
            </button>
          </div>
        </form>

        {/* Bloc de conseils pour choisir un mot de passe sécurisé */}
        <div className="mt-6 bg-orange-100 p-4 rounded text-sm text-orange-900">
          <h4 className="font-semibold">
            {t('changePassword.tips.title') || "Conseils pour un mot de passe sécurisé :"}
          </h4>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>{t('changePassword.tips.unique') || "Utilisez un mot de passe unique"}</li>
            <li>{t('changePassword.tips.mix') || "Mélangez majuscules, minuscules, chiffres et caractères spéciaux"}</li>
            <li>{t('changePassword.tips.avoid') || "Évitez les informations personnelles"}</li>
            <li>{t('changePassword.tips.changeOften') || "Changez régulièrement votre mot de passe"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
