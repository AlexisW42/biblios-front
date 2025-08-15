import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@radix-ui/themes';

import useAuthStore from '../../stores/authStore';
import { API_BASE_URL } from '../../utils/constants';

interface Loan {
    loan_id: number;
    loan_date: string;
    due_date: string;
    return_date: string | null;
    fine_amount?: number;
    user: {
        user_id: number;
        full_name: string;
        username: string;
    };
    copy: {
        copy_id: number;
        book: {
            book_id: number;
            title: string;
            isbn: string;
        };
        barcode: string;
    };
}

interface PaginatedResponse {
    data: Loan[];
    total: number;
    page: number;
    limit: number;
}

const IndexLoan: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros y búsqueda
    const [search, setSearch] = useState('');
    const [isActive, setIsActive] = useState('');
    const [sortBy, setSortBy] = useState('loan_id');
    const [order, setOrder] = useState('DESC');

    // Paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Recarga
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [returningId, setReturningId] = useState<number | null>(null);

    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    useEffect(() => {
        const fetchLoans = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (isActive) params.append('isActive', isActive);
                if (sortBy) params.append('sortBy', sortBy);
                if (order) params.append('order', order);
                params.append('page', currentPage.toString());
                params.append('limit', itemsPerPage.toString());

                const response = await axiosPrivate.get<PaginatedResponse>(`${API_BASE_URL}/loans?${params.toString()}`);
                setLoans(response.data.data);
                setTotalPages(Math.ceil(response.data.total / itemsPerPage));
            } catch (err) {
                setError('Error al cargar los préstamos. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [search, isActive, sortBy, order, currentPage, itemsPerPage, axiosPrivate, refreshTrigger]);

    // Paginación
    const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    // Búsqueda
    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);
    };

    // Función para devolver préstamo con confirmación
    const handleReturnLoan = async (loanId: number) => {
        const confirmReturn = window.confirm('¿Está seguro que desea devolver este préstamo?');
        if (!confirmReturn) return;

        setReturningId(loanId);
        try {
            await axiosPrivate.put(`/api/loans/${loanId}/return`);
            setRefreshTrigger((prev) => prev + 1); // Recarga la lista
        } catch (err) {
            alert('No se pudo devolver el préstamo.');
        } finally {
            setReturningId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-xl font-semibold text-gray-700">Cargando préstamos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
                <div className="text-xl font-semibold text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Listado de Préstamos</h1>
                </div>

                {/* Filtros y búsqueda */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                    <input
                        type="text"
                        placeholder="Buscar usuario, libro..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                    />
                    <select
                        value={isActive}
                        onChange={(e) => setIsActive(e.target.value)}
                        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                    >
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Devueltos</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                    >
                        <option value="loan_id">ID Préstamo</option>
                        <option value="loan_date">Fecha Préstamo</option>
                        <option value="due_date">Fecha Vencimiento</option>
                        <option value="return_date">Fecha Devolución</option>
                        <option value="user.full_name">Usuario</option>
                        <option value="book.title">Libro</option>
                    </select>
                    <select
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                    >
                        <option value="ASC">Ascendente</option>
                        <option value="DESC">Descendente</option>
                    </select>
                    <Button onClick={handleSearch}>
                        Añadir Nuevo Libro
                    </Button>
                </div>

                {loans.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-8">
                        No hay préstamos para mostrar con los filtros aplicados.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Usuario</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Libro</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha Préstamo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha Vencimiento</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha Devolución</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Multa</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loans.map((loan) => (
                                    <tr key={loan.loan_id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-4 py-3">{loan.loan_id}</td>
                                        <td className="px-4 py-3">{loan.user?.full_name || loan.user?.username || '-'}</td>
                                        <td className="px-4 py-3">{loan.copy?.book?.title || '-'}</td>
                                        <td className="px-4 py-3">{loan.loan_date?.slice(0, 10)}</td>
                                        <td className="px-4 py-3">{loan.due_date?.slice(0, 10)}</td>
                                        <td className="px-4 py-3">{loan.return_date ? loan.return_date.slice(0, 10) : 'Pendiente'}</td>
                                        <td className="px-4 py-3">
                                            {typeof loan.fine_amount === 'number'
                                                ? `$${loan.fine_amount.toFixed(2)}`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!loan.return_date && (
                                                <button
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
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
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndexLoan;