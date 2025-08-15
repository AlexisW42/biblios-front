import React, { useEffect, useState } from 'react';
import useAuthStore from '../../stores/authStore';
import { API_BASE_URL } from '../../utils/constants';

const IndexDashboard: React.FC = () => {
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    const [stats, setStats] = useState<any>(null);
    const [mostBorrowedBooks, setMostBorrowedBooks] = useState<any[]>([]);
    const [usersMostLoans, setUsersMostLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [statsRes, booksRes, usersRes] = await Promise.all([
                    axiosPrivate.get(`/dashboard`),
                    axiosPrivate.get(`/most-borrowed-books?limit=5`),
                    axiosPrivate.get(`/users-most-loans?limit=5`)
                ]);
                setStats(statsRes.data);
                setMostBorrowedBooks(booksRes.data);
                setUsersMostLoans(usersRes.data);
                setError(null);
            } catch (err) {
                setError('Error al cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [axiosPrivate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">Cargando estadísticas...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-red-700">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center ">Estadísticas del Sistema</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <StatCard label="Libros" value={stats.totalBooks} />
                <StatCard label="Copias" value={stats.totalCopies} />
                <StatCard label="Usuarios" value={stats.totalUsers} />
                <StatCard label="Préstamos activos" value={stats.activeLoans} />
                <StatCard label="Préstamos vencidos" value={stats.overdueLoans} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Libros más prestados</h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">Título</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Autor</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Préstamos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mostBorrowedBooks.map((book, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-4 py-3">{book.title}</td>
                                        <td className="px-4 py-3">{book.author}</td>
                                        <td className="px-4 py-3">{book.loanCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Usuarios con más préstamos</h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Usuario</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Préstamos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usersMostLoans.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-4 py-3">{user.fullName}</td>
                                        <td className="px-4 py-3">{user.username}</td>
                                        <td className="px-4 py-3">{user.loanCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {value}
        </div>
        <div className="text-sm text-gray-600 mt-2">{label}</div>
    </div>
);

export default IndexDashboard;