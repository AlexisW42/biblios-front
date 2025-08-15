// src/layouts/MainLayout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Import Outlet
import useAuthStore from '../stores/authStore';
import LogoutButton from '../components/auth/LogoutButton';

// No longer needs 'children' prop interface if using Outlet
// interface MainLayoutProps {
//     children: React.ReactNode;
// }

const MainLayout: React.FC = () => { // No longer needs props
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div>
            <header style={{ borderBottom: '1px solid #ccc', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My App</h1>
                <nav>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '15px' }}>
                        <li><Link to="/">Home</Link></li>
                        {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
                        {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
                        {isAuthenticated && <li><Link to="/protected">Protected</Link></li>}
                        {isAuthenticated && <li><LogoutButton /></li>}
                    </ul>
                </nav>
            </header>

            <main style={{ padding: '20px' }}>
                <Outlet /> {/* This is where the nested route's content will render */}
            </main>

            <footer style={{ borderTop: '1px solid #ccc', padding: '10px 20px', textAlign: 'center', marginTop: '20px' }}>
                <p>&copy; {new Date().getFullYear().toString()} My App</p>
            </footer>
        </div>
    );
};

export default MainLayout;