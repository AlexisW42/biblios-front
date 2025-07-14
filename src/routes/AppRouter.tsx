import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedPage from '../pages/ProtectedPage';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layouts/MainLayout'; // Si tienes un layout
// import NotFoundPage from '../pages/NotFoundPage'; // Una página para 404

const AppRouter: React.FC = () => {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/protected"
                        element={
                            <PrivateRoute>
                                <ProtectedPage />
                            </PrivateRoute>
                        }
                    />
                    {/* <Route path="*" element={<NotFoundPage />} /> Ruta para 404 */}
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default AppRouter;