import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { API_ENDPOINTS } from '../../api/urls';
import { useGlobalState } from '../../context/GlobalStateProvider';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setSuccessMessage, setErrorMessage } = useGlobalState();
    const { t } = useTranslation();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(API_ENDPOINTS.postRegister(), { email, password, name });
            if (res.status >= 200) {
                setSuccessMessage(t('registerSuccess'));
                navigate('/login');
            } else {
                throw new Error(String(res.status));
            }
        } catch (error: any) {
            setErrorMessage(t('registerFailed'));
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white p-8 shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-center">{t('register')}</h2>
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg">
                            {t('register')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
