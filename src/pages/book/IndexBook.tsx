// src/components/books/IndexBook.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Flex, Heading, TextField } from '@radix-ui/themes';
import type { Book } from '../../types';
import { API_BASE_URL } from '../../utils/constants';
import { ChevronLeft, ChevronRight, PlusCircle, Eye } from 'lucide-react'; 
import useAuthStore from '../../stores/authStore';

// Importa los nuevos modales
import CreateBookModal from './CreateBookModal';
import ViewBookModal from './ViewBookModal';
import { Link } from 'react-router-dom';

// Define la estructura de la respuesta de la API con paginación
interface PaginatedResponse {
    data: Book[];
    total: number;
    page: number;
    limit: number;
}

// Define la estructura de la respuesta de la API para las carreras
interface Major {
  majorId: number;
  name: string;
}

// Componente principal para la lista de libros
const IndexBook: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los valores de los campos de búsqueda (sin disparar el fetch)
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [majorId, setMajorId] = useState('');

    // Nuevo estado que se usa para la búsqueda real
    const [searchFilters, setSearchFilters] = useState({
        title: '',
        author: '',
        category: '',
        majorId: '',
    });

    // Estado para la lista de carreras universitarias
    const [majors, setMajors] = useState<Major[]>([]);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    
    // Estado para el manejo del modal de creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Estados para el manejo del modal de visualización
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Nuevo estado para forzar la recarga
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Obtenemos la instancia de axios autenticada
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    // Efecto para obtener la lista de carreras universitarias desde la API
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const response = await axiosPrivate.get<Major[]>(`${API_BASE_URL}/majors`);
                setMajors(response.data);
            } catch (err) {
                console.error('Error al obtener las carreras:', err);
            }
        };

        fetchMajors();
    }, [axiosPrivate]);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (searchFilters.title) params.append('title', searchFilters.title);
                if (searchFilters.author) params.append('author', searchFilters.author);
                if (searchFilters.category) params.append('category', searchFilters.category);
                if (searchFilters.majorId) params.append('majorId', searchFilters.majorId);
                params.append('page', currentPage.toString());
                params.append('limit', itemsPerPage.toString());

                const response = await axiosPrivate.get<PaginatedResponse>(`${API_BASE_URL}/books?${params.toString()}`);

                setBooks(response.data.data);
                setTotalPages(Math.ceil(response.data.total / itemsPerPage));
            } catch (err) {
                console.error('Error al obtener los libros:', err);
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        setError(`Error al cargar los libros: ${err.response.status} ${err.response.statusText}. Por favor, inténtalo de nuevo.`);
                    } else if (err.request) {
                        setError('No se pudo conectar al servidor. Por favor, verifica tu conexión a internet o que el servidor esté en línea.');
                    } else {
                        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
                    }
                } else {
                    setError('No se pudieron cargar los libros. Por favor, asegúrate de que el servidor esté funcionando y vuelve a intentarlo.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [searchFilters, currentPage, itemsPerPage, axiosPrivate, refreshTrigger]);

    // Función para manejar la búsqueda al presionar el botón
    const handleSearch = () => {
        setSearchFilters({
            title,
            author,
            category,
            majorId,
        });
        setCurrentPage(1); // Reiniciar la paginación al buscar
    };

    // Funciones para la paginación
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    // Funciones para manejar el modal de creación
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };
    
    // Función para manejar la actualización y recarga
    const handleBookCreated = () => {
        setRefreshTrigger(prev => prev + 1); // Incrementa el contador para forzar el useEffect
        handleCloseCreateModal(); // Cierra el modal de creación
    };
    
    // Funciones para manejar el modal de visualización
    const handleViewBook = (book: Book) => {
        setSelectedBook(book);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedBook(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-xl font-semibold text-gray-700">Cargando libros...</div>
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
                <Flex justify="between" align="center" mb="6">
                    <Heading>Listado de Libros</Heading>
                    <Button onClick={handleOpenCreateModal}>
                        <PlusCircle />
                        Añadir Nuevo Libro
                    </Button>
                </Flex>

                {/* Sección de búsqueda y filtros */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <TextField.Root placeholder="Buscar por título..." value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField.Root placeholder="Buscar por autor..." value={author} onChange={(e) => setAuthor(e.target.value)} />
                    <TextField.Root placeholder="Buscar por categoría..." value={category} onChange={(e) => setCategory(e.target.value)} />
                    <select
                        value={majorId}
                        onChange={(e) => setMajorId(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        <option value="">Todas las Carreras</option>
                        {majors.map((major) => (
                            <option key={major.majorId} value={String(major.majorId)}>
                                {major.name}
                            </option>
                        ))}
                    </select>
                    <Button onClick={handleSearch} className="w-full">
                        Buscar
                    </Button>
                </div>

                {books.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-8">
                        No hay libros disponibles para mostrar con los filtros aplicados.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">ISBN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Título</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Autor</th>
                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden md:table-cell">Editorial</th> */}
                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden lg:table-cell">Año</th> */}
                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Categoría</th> */}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Copias</th>
                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ubicación</th> */}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.book_id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{book.isbn}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.title}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.author}</td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{book.publisher || 'N/A'}</td> */}
                                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">{book.publish_year || 'N/A'}</td> */}
                                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">{book.category || 'N/A'}</td> */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            <Link to={`/books/${book.book_id}/copies`}>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">{book.copies_total}</span>
                                            </Link>
                                        </td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.location ? book.location.branch_name : 'Desconocida'}</td> */}
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewBook(book)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    aria-label={`Ver libro ${book.book_id}`}
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {/* Add edit and delete buttons here if needed */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Controles de Paginación */}
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

            {/* Renderizado de los modales */}
            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onUpdate={handleBookCreated}
            />
            <ViewBookModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                book={selectedBook}
            />
        </div>
    );
};

export default IndexBook;