import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function ChangePasswordClient() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.error.mismatch'));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
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

      setSuccess(t('changePassword.success'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        setError(t('changePassword.error.incorrect'));
      } else {
        setError(t('changePassword.error.generic'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-bold text-center text-orange-800 mb-4">
          {t('changePassword.title')}
        </h2>
        {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">{t('changePassword.current')}</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">{t('changePassword.new')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
            <p className="text-sm text-gray-500">{t('changePassword.rules')}</p>
          </div>
          <div className="mb-6">
            <label className="block font-medium text-gray-700">{t('changePassword.confirm')}</label>
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
              {t('changePassword.cancel')}
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            >
              {t('changePassword.submit')}
            </button>
          </div>
        </form>
        <div className="mt-6 bg-orange-100 p-4 rounded text-sm text-orange-900">
          <h4 className="font-semibold">{t('changePassword.tips.title')}</h4>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>{t('changePassword.tips.unique')}</li>
            <li>{t('changePassword.tips.mix')}</li>
            <li>{t('changePassword.tips.avoid')}</li>
            <li>{t('changePassword.tips.changeOften')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordClient;
