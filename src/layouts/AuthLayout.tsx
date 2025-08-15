// src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet

const AuthLayout: React.FC = () => { // No longer needs props
    return (
        <div className="auth-container">
            <main>
                <Outlet /> {/* This is where the nested route's content will render */}
            </main>
        </div>
    );
};

export default AuthLayout;