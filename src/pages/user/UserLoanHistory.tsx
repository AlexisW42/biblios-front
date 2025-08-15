import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import axios from 'axios';

const UserLoanHistory: React.FC = () => {
    const { id } = useParams();
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Nuevo estado para feedback
    const [returningId, setReturningId] = useState<number | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get(`/users/${id}`);
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar el historial.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, axiosPrivate]);

    // Función para devolver préstamo
    const handleReturnLoan = async (loanId: number) => {
        setReturningId(loanId);
        try {
            await axiosPrivate.post(`/loans/${loanId}/return`);
            // Recargar datos del usuario
            const response = await axiosPrivate.get(`/users/${id}`);
            setUser(response.data);
        } catch (err) {
            setError('No se pudo devolver el préstamo.');
        } finally {
            setReturningId(null);
        }
    };

    if (loading) return <p className="text-center mt-8">Cargando historial...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 rounded-lg">
            <h1 className="text-xl font-bold mb-4">Historial de préstamos de {user.full_name}</h1>
            {user.loans && user.loans.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-md">
                    <thead className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white'>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase rounded-tl-lg">ID Préstamo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Libro</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Fecha Préstamo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Fecha Vencimiento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Fecha Devolución</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase rounded-tr-lg">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.loans.map((loan: any) => (
                            <tr key={loan.loan_id}>
                                <td className="px-6 py-4">{loan.loan_id}</td>
                                <td className="px-6 py-4">{loan.book?.title || '-'}</td>
                                <td className="px-6 py-4">{loan.loan_date?.slice(0, 10)}</td>
                                <td className="px-6 py-4">{loan.due_date?.slice(0, 10)}</td>
                                <td className="px-6 py-4">{loan.return_date ? loan.return_date.slice(0, 10) : 'Pendiente'}</td>
                                <td className="px-6 py-4">
                                    {!loan.return_date && (
                                        <button
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                                            onClick={() => handleReturnLoan(loan.loan_id)}
                                            disabled={returningId === loan.loan_id}
                                        >
                                            {returningId === loan.loan_id ? 'Devolviendo...' : 'Devolver'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="p-6 text-center text-gray-500">Este usuario no tiene préstamos registrados.</p>
            )}
        </div>
    );
};

export default UserLoanHistory;