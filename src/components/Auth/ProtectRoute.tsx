import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_ENDPOINTS } from '../../api/urls';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate("/login?error=unauthorized");
            return;
        }

        // トークンを使ってバックエンドに認証リクエスト
        axios
            .get(API_ENDPOINTS.getUserAuth(), {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setIsAuthenticated(true); // 認証成功
            })
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    if (!isAuthenticated) {
        return <p>Loading...</p>; // 認証確認中にローディング画面を表示
    }

    return <>{children}</>;
};

export default ProtectedRoute;
