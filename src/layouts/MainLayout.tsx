// src/layouts/MainLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import LogoutButton from '../components/auth/LogoutButton';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div>
            {/* <header style={{ borderBottom: '1px solid #ccc', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My App</h1>
                <nav>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '15px' }}>
                        <li><Link to="/">Home</Link></li>
                        {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
                        {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
                        {isAuthenticated && <li><Link to="/protected">Protected</Link></li>}
                        <li><LogoutButton /></li>
                    </ul>
                </nav>
            </header>
            <main style={{ padding: '20px' }}>
                {children}
            </main> */}
            {/* Opcional: Footer */}
            {/* <footer><p>&copy; 2025 My App</p></footer> */}
        </div>
    );
};

export default MainLayout;