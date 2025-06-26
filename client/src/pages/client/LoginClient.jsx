import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import axios from 'axios';
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';

const LoginClient = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErreur('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        motDePasse
      });
      
      const { token, utilisateur } = response.data;
      
      // Stocker le token et les données utilisateur
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(utilisateur));
      
      // Rediriger selon le rôle
      if (utilisateur.role === "boulanger") {
        navigate("/boulanger");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setErreur(t("erreurConnexion"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <>
      <HeaderClient />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-300/20 to-yellow-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {/* Header avec logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {t("Bienvenue")}
              </h1>
              <p className="text-gray-600 mt-2">{t("connectezVous")}</p>
            </div>

            {/* Carte de connexion */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Champ Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    {t("email")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      placeholder="votreemail@exemple.com"
                      required
                    />
                  </div>
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    {t("motDePasse")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Message d'erreur */}
                {erreur && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{erreur}</p>
                  </div>
                )}

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("chargementConnexion")}
                    </div>
                  ) : (
                    t("seConnecter")
                  )}
                </button>

                {/* Liens */}
                <div className="space-y-3 pt-4">
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors duration-200"
                    >
                      {t("motDePasseOublie")}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t("ou")}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      className="text-sm text-gray-600 hover:text-amber-600 transition-colors duration-200"
                    >
                      {t("pasEncoreDeCompte")}
                      <span className="font-semibold text-amber-600 hover:text-amber-700 ml-1">
                        {t("creerCompte")}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-sm text-gray-500">
              <p>{t("footer")}</p>

            </div>
          </div>
        </div>

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
    </>
  );
};

export default LoginClient;