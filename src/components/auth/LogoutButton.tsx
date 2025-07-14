// src/components/auth/LogoutButton.tsx
import React from 'react';
import useAuthStore from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login'); // Redirige a la página de login después de cerrar sesión
    };

    if (!isAuthenticated) return null;

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;