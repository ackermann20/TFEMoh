import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';

const LoginClient = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        motDePasse
      });

      const { token, utilisateur } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(utilisateur));

      if (utilisateur.role === "boulanger") {
        navigate("/boulanger");
      } else {
        navigate("/produits");
      }

    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setErreur(t("erreurConnexion"));
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />

      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">{t("connexion")}</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              {t("email")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-amber-500"
              id="email"
              type="email"
              placeholder="votreemail@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {t("motDePasse")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-amber-500"
              id="password"
              type="password"
              placeholder="********"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
          </div>

          {erreur && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{erreur}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              type="submit"
            >
              {t("seConnecter")}
            </button>

            <a
              className="inline-block align-baseline font-bold text-sm text-amber-600 hover:text-amber-800"
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              {t("creerCompte")}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginClient;
