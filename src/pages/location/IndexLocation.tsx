import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Flex, Heading, TextField } from '@radix-ui/themes';
import type { Location } from '../../types'; // Asume que tienes un tipo 'Location'
import { API_BASE_URL } from '../../utils/constants';
import { ChevronLeft, ChevronRight, PlusCircle, Eye } from 'lucide-react'; 
import useAuthStore from '../../stores/authStore';

// Importa los nuevos modales (debes crearlos)
import CreateLocationModal from './CreateLocationModal';
import ViewLocationModal from './ViewLocationModal';
import { Link } from 'react-router-dom';

// Define la estructura de la respuesta de la API con paginación
interface PaginatedResponse {
    data: Location[];
    total: number;
    page: number;
    limit: number;
}

// Componente principal para la lista de ubicaciones
const IndexLocation: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los valores del campo de búsqueda
    const [searchQuery, setSearchQuery] = useState('');

    // Nuevo estado que se usa para la búsqueda real
    const [searchFilter, setSearchFilter] = useState('');
    
    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    
    // Estado para el manejo del modal de creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Estados para el manejo del modal de visualización
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Nuevo estado para forzar la recarga
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Obtenemos la instancia de axios autenticada
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (searchFilter) params.append('search', searchFilter);
                params.append('page', currentPage.toString());
                params.append('limit', itemsPerPage.toString());

                const response = await axiosPrivate.get<PaginatedResponse>(`${API_BASE_URL}/locations?${params.toString()}`);

                setLocations(response.data.data);
                setTotalPages(Math.ceil(response.data.total / itemsPerPage));
            } catch (err) {
                console.error('Error al obtener las ubicaciones:', err);
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        setError(`Error al cargar las ubicaciones: ${err.response.status} ${err.response.statusText}. Por favor, inténtalo de nuevo.`);
                    } else if (err.request) {
                        setError('No se pudo conectar al servidor. Por favor, verifica tu conexión a internet o que el servidor esté en línea.');
                    } else {
                        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
                    }
                } else {
                    setError('No se pudieron cargar las ubicaciones. Por favor, asegúrate de que el servidor esté funcionando y vuelve a intentarlo.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [searchFilter, currentPage, itemsPerPage, axiosPrivate, refreshTrigger]);

    // Función para manejar la búsqueda al presionar el botón
    const handleSearch = () => {
        setSearchFilter(searchQuery);
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
    const handleLocationCreated = () => {
        setRefreshTrigger(prev => prev + 1); // Incrementa el contador para forzar el useEffect
        handleCloseCreateModal(); // Cierra el modal de creación
    };
    
    // Funciones para manejar el modal de visualización
    const handleViewLocation = (location: Location) => {
        setSelectedLocation(location);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedLocation(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-xl font-semibold text-gray-700">Cargando ubicaciones...</div>
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
                    <Heading>Listado de Ubicaciones</Heading>
                    <Button onClick={handleOpenCreateModal}>
                        <PlusCircle />
                        Añadir Nueva Ubicación
                    </Button>
                </Flex>

                {/* Sección de búsqueda y filtros */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <TextField.Root 
                        placeholder="Buscar por sucursal, piso o estantería..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="col-span-2"
                    />
                    <Button onClick={handleSearch} className="w-full">
                        Buscar
                    </Button>
                </div>

                {locations.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-8">
                        No hay ubicaciones disponibles para mostrar con los filtros aplicados.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sucursal</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Piso</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estantería</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {locations.map((location) => (
                                    <tr key={location.location_id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{location.location_id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{location.branch_name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{location.floor}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{location.shelf}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewLocation(location)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    aria-label={`Ver ubicación ${location.location_id}`}
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {/* Aquí puedes añadir botones para editar y eliminar si lo necesitas */}
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

            {/* Renderizado de los modales (debes crearlos) */}
            <CreateLocationModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onUpdate={handleLocationCreated}
            />
            <ViewLocationModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                location={selectedLocation}
            />
        </div>
    );
};

export default IndexLocation;