import React, { useState, useEffect } from 'react';
import { Eye, Edit } from 'lucide-react';
import useAuthStore from '../../stores/authStore';


// Define las interfaces necesarias basadas en tu entidad BookCopy
interface Book {
    book_id: number;
    title: string;
}

export interface BookCopy {
    copy_id: number;
    book: Relation<Book>;
    barcode: string;
    status: 'available' | 'loaned' | 'lost' | 'damaged';
    acquisition_date: string | null; // Usamos string porque la API devuelve un string ISO
}

// Define los props que el componente recibirá
interface IndexBookCopiesProps {
    bookId: string;
}

const IndexBookCopies: React.FC<IndexBookCopiesProps> = ({ bookId }) => {
    const [copies, setCopies] = useState<BookCopy[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { axiosPrivate } = useAuthStore();
    
    // Estado para forzar la recarga, similar a tu ejemplo
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // useEffect para obtener los datos
    useEffect(() => {
        const fetchBookCopies = async () => {
            setLoading(true);
            try {
                // Llama al endpoint de tu API con el bookId
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

        if (bookId) {
            fetchBookCopies();
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
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                Copias del Libro con ID: {bookId}
            </h1>
            
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
                                            {copy.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {copy.acquisition_date ? new Date(copy.acquisition_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {/* Botones de acción, puedes agregar lógica para modales aquí */}
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
        </div>
    );
};

export default IndexBookCopies;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button, Flex, Heading, TextField } from '@radix-ui/themes';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import useAuthStore from '../../stores/authStore';
// import { API_BASE_URL } from '../../utils/constants';

// // Definir la estructura de los datos que esperamos de la API
// interface User {
//     user_id: number;
//     username: string;
//     full_name: string;
// }

// interface Book {
//     book_id: number;
//     title: string;
//     isbn: string;
// }

// interface BookCopy {
//     copy_id: number;
//     status: 'available' | 'loaned' | 'lost';
//     book: Book;
// }

// interface Loan {
//     loan_id: number;
//     loan_date: string;
//     due_date: string;
//     return_date?: string | null;
//     user: User;
//     copy: BookCopy;
// }

// interface PaginatedResponse {
//     data: Loan[];
//     total: number;
//     page: number;
//     limit: number;
// }

// const IndexLoan: React.FC = () => {
//     const [loans, setLoans] = useState<Loan[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // Estados para la búsqueda
//     const [search, setSearch] = useState('');
//     const [searchQuery, setSearchQuery] = useState('');

//     // Estados para la paginación
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [itemsPerPage] = useState<number>(10);
//     const [totalPages, setTotalPages] = useState<number>(0);
    
//     // Obtenemos la instancia de axios autenticada
//     const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

//     useEffect(() => {
//         const fetchLoans = async () => {
//             setLoading(true);
//             setError(null);
            
//             try {
//                 const params = new URLSearchParams();
//                 if (searchQuery) params.append('search', searchQuery);
//                 params.append('page', currentPage.toString());
//                 params.append('limit', itemsPerPage.toString());

//                 const response = await axiosPrivate.get<PaginatedResponse>(`${API_BASE_URL}/loans`, { params });
                
//                 setLoans(response.data.data);
//                 setTotalPages(Math.ceil(response.data.total / itemsPerPage));
//             } catch (err) {
//                 console.error('Error fetching loans:', err);
//                 if (axios.isAxiosError(err)) {
//                     setError(`Error al cargar los préstamos: ${err.response?.data?.message || err.message}`);
//                 } else {
//                     setError('Ocurrió un error inesperado al cargar los préstamos.');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchLoans();
//     }, [searchQuery, currentPage, itemsPerPage, axiosPrivate]);

//     // Función para manejar la búsqueda al presionar el botón
//     const handleSearch = () => {
//         setSearchQuery(search);
//         setCurrentPage(1); // Reiniciar la paginación al buscar
//     };

//     // Funciones para la paginación
//     const handlePreviousPage = () => {
//         setCurrentPage((prev) => Math.max(prev - 1, 1));
//     };

//     const handleNextPage = () => {
//         setCurrentPage((prev) => Math.min(prev + 1, totalPages));
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//                 <div className="text-xl font-semibold text-gray-700">Cargando préstamos...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
//                 <div className="text-xl font-semibold text-red-700">{error}</div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 sm:p-6 lg:p-8 font-inter">
//             <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
//                 <Flex justify="between" align="center" mb="6">
//                     <Heading>Listado de Préstamos</Heading>
//                     {/* Botón para crear un nuevo préstamo podría ir aquí */}
//                 </Flex>

//                 {/* Sección de búsqueda */}
//                 <div className="mb-6 flex space-x-4">
//                     <TextField.Root
//                         placeholder="Buscar por usuario o título de libro..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="flex-grow"
//                     />
//                     <Button onClick={handleSearch}>
//                         Buscar
//                     </Button>
//                 </div>

//                 {loans.length === 0 ? (
//                     <div className="text-center text-gray-600 text-lg py-8">
//                         No hay préstamos disponibles para mostrar.
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
//                                 <tr>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">ID</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Usuario</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Libro</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Copia ID</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Préstamo</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vencimiento</th>
//                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Estado</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {loans.map((loan) => (
//                                     <tr key={loan.loan_id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loan_id}</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{loan.user.full_name} ({loan.user.username})</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{loan.copy.book.title}</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">{loan.copy.copy_id}</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(loan.loan_date).toLocaleDateString()}</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(loan.due_date).toLocaleDateString()}</td>
//                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
//                                                 ${loan.return_date
//                                                     ? 'bg-green-100 text-green-800' // Deuelto
//                                                     : new Date(loan.due_date) < new Date() ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800' // Vencido o en préstamo
//                                                 }
//                                             `}>
//                                                 {loan.return_date ? 'Devuelto' : (new Date(loan.due_date) < new Date() ? 'Vencido' : 'Prestado')}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
                
//                 {/* Controles de Paginación */}
//                 {totalPages > 1 && (
//                     <div className="flex justify-center items-center mt-6 space-x-4">
//                         <button
//                             onClick={handlePreviousPage}
//                             disabled={currentPage === 1}
//                             className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <ChevronLeft className="h-5 w-5" />
//                         </button>
//                         <span className="text-sm font-medium text-gray-700">
//                             Página {currentPage} de {totalPages}
//                         </span>
//                         <button
//                             onClick={handleNextPage}
//                             disabled={currentPage === totalPages}
//                             className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <ChevronRight className="h-5 w-5" />
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default IndexLoan;