import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AuthLayout from '../layouts/AuthLayout'; // Importa el nuevo layout
import Layout from '../layouts/Layout';
import CreateBookForm from '../pages/book/CreateBook';
import IndexBook from '../pages/book/IndexBook';
import IndexUser from '../pages/user/IndexUser.tsx';
import IndexBookCopies from '../pages/bookCopies/IndexBookCopies.tsx';
import UserLoanHistory from '../pages/user/UserLoanHistory';
import IndexLoan from '../pages/loan/IndexLoan.tsx';
import IndexDashboard from '../pages/dashboard/IndexDashboard.tsx';


const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Rutas con AuthLayout */}
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<Layout />}>
                    <Route path="/create-book" element={<CreateBookForm />} />
                    <Route path="/books" element={<IndexBook />} />
                    <Route path="/users" element={<IndexUser />} />
                    {/* <Route path="/loans" element={<IndexLoan />} /> */}
                    <Route path="/books/:bookId/copies" element={<IndexBookCopies />} />
                    <Route path="/usuarios/:id/historial" element={<UserLoanHistory />} />
                    <Route path="/loans" element={<IndexLoan />}/>
                    <Route path="/dashboard" element={<IndexDashboard />} />
                </Route>

                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
        </Router>
    );
};

export default AppRouter;