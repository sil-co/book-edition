import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { API_ENDPOINTS } from '../../api/urls';
import { useGlobalState } from '../../context/GlobalStateProvider';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setSuccessMessage, setErrorMessage } = useGlobalState();
    const { t } = useTranslation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const error = searchParams.get('error');
        if (error) {
            setErrorMessage(error);
        }
    }, [location.search]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.post(
                API_ENDPOINTS.postUserAuth(),
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            ).then(() => {
                navigate('/books');
            }).catch(e => {
                console.error(e);
            });
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(API_ENDPOINTS.postLogin(), { email, password });
            setSuccessMessage('Login successful');
            const { token } = res.data;
            localStorage.setItem('token', token);
            navigate('/books');
        } catch (err) {
            setErrorMessage('Invalid email or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">{t('login')}</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
                        {t('login')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
