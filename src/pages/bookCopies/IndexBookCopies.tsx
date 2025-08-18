import React, { useState, useEffect } from 'react';
import { Eye, Edit, PlusCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { BookCopy, Book } from '../../types';
import useAuthStore from '../../stores/authStore';
import CreateLoanModal from '../loan/CreateLoanModal'; // Importa el modal
import CreateBookCopyModal from './CreateBookCopyModal'; // Importar el nuevo modal
import { Button } from '@radix-ui/themes';


interface IndexBookCopiesProps {
    bookId: string;
}

const IndexBookCopies: React.FC = () => {
    const { bookId } = useParams();
    const [copies, setCopies] = useState<BookCopy[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [isCreateCopyModalOpen, setIsCreateCopyModalOpen] = useState(false);
    const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null);
    const [book, setBook] = useState<Book | null>(null);

    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    // Estado para forzar la recarga, similar a tu ejemplo
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // useEffect para obtener los datos
    useEffect(() => {
        const fetchBookCopies = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get<BookCopy[]>(`/books/${bookId}/copies`);
                setCopies(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching book copies:', err);
                // Manejar el caso 404 de tu API
                if (err.response && err.response.status === 404) {
                    setCopies([]); // Asegura que la lista esté vacía
                    setError(null); // No mostrar un error si la respuesta es un 404 "sin copias"
                } else {
                    setError('No se pudieron cargar las copias del libro.');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchBook = async () => {
            try {
                const response = await axiosPrivate.get<Book>(`/books/${bookId}`);
                setBook(response.data);
            } catch (err) {
                setBook(null);
            }
        };

        if (bookId) {
            fetchBookCopies();
            fetchBook();
        }
    }, [bookId, refreshTrigger]);

    // Función para manejar la recarga de datos si es necesario (ej. después de editar)
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return <p className="text-center mt-8">Cargando copias...</p>;
    }

    if (error) {
        return <p className="text-center mt-8 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Copias de{book ? `: ${book.title}` : ''}
                </h1>
                <Button onClick={() => setIsCreateCopyModalOpen(true)}>
                    <PlusCircle className="h-5 w-5" />
                    Añadir Copia
                </Button>
            </div>
            
            {/* Contenedor de la tabla */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {copies.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Código de Barras
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Fecha de Adquisición
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {copies.map((copy) => (
                                <tr key={copy.copy_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {copy.copy_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {copy.barcode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                copy.status === 'available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : copy.status === 'loaned'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : copy.status === 'lost'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {copy.status === 'available'
                                                ? 'disponible'
                                                : copy.status === 'loaned'
                                                ? 'prestado'
                                                : copy.status === 'lost'
                                                ? 'perdido'
                                                : 'otro'
                                            }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {copy.acquisition_date ? new Date(copy.acquisition_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-indigo-600 hover:text-indigo-900"
                                                aria-label={`Ver copia ${copy.copy_id}`}
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-900"
                                                aria-label={`Editar copia ${copy.copy_id}`}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            {copy.status === 'available' && (
                                                <button
                                                    className="text-blue-600 hover:text-blue-900"
                                                    aria-label={`Prestar copia ${copy.copy_id}`}
                                                    onClick={() => {
                                                      setSelectedCopyId(copy.copy_id);
                                                      setShowLoanModal(true);
                                                    }}
                                                >
                                                    Prestar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="p-6 text-center text-gray-500">
                        No se encontraron copias para este libro.
                    </p>
                )}
            </div>
            <CreateLoanModal
                isOpen={showLoanModal}
                onClose={() => setShowLoanModal(false)}
                onUpdate={handleRefresh}
                copyId={selectedCopyId}
            />
            <CreateBookCopyModal
                isOpen={isCreateCopyModalOpen}
                onClose={() => setIsCreateCopyModalOpen(false)}
                onUpdate={handleRefresh}
                bookId={bookId}
            />
        </div>
    );
};

export default IndexBookCopies;
