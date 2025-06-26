import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordClient() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const res = await axios.post(`http://localhost:3000/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || t("erreurServeur"));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-xl font-bold mb-4 text-center">{t("motDePasseOublie")}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          className="w-full p-2 border mb-3 rounded"
          placeholder={t("placeholderEmail")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full bg-amber-600 text-white p-2 rounded">
          {t("envoyer")}
        </button>
      </form>
      {message && <p className="text-green-600 mt-3">{message}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
