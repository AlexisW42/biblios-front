import React, { useState, useEffect } from 'react';
import type { User } from '../../types/auth';
import useAuthStore from '../../stores/authStore';
import { Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importa los modales correctos
import ViewUserModal from './ViewUserModal';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';

// Define la estructura de la respuesta de la API con paginación
interface PaginatedResponse {
    data: User[];
    total: number;
}

const IndexUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los filtros y ordenación
    const [search, setSearch] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('user_id'); 
    const [order, setOrder] = useState<string>('ASC');

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    
    // Estados para el manejo de modales
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // Nuevo estado para forzar la recarga
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const params = {
                    search,
                    role,
                    sortBy,
                    order,
                    page: currentPage,
                    limit: itemsPerPage,
                };
                
                const response = await axiosPrivate.get<PaginatedResponse>('/users', { params });
                setUsers(response.data.data);
                setTotalPages(Math.ceil(response.data.total / itemsPerPage));
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [search, role, sortBy, order, currentPage, itemsPerPage, axiosPrivate, refreshTrigger]); // Agrega refreshTrigger a las dependencias

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reinicia la página al buscar
    };
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        setCurrentPage(1); // Reinicia la página al filtrar
    };
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [newSortBy, newOrder] = e.target.value.split('-');
        setSortBy(newSortBy);
        setOrder(newOrder);
        setCurrentPage(1); // Reinicia la página al ordenar
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedUser(null);
    };
    
    // Función específica para cerrar el modal de edición
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleUserCreated = () => {
        setRefreshTrigger(prev => prev + 1); // Triggers a re-fetch of the user list
        handleCloseCreateModal();
    };

    // Función para manejar la actualización y recarga
    const handleUpdateUser = () => {
        setRefreshTrigger(prev => prev + 1); // Incrementa el contador para forzar el useEffect
        handleCloseEditModal(); // Llama a la nueva función de cierre
    };

    // Funciones para la paginación
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    if (loading) return <p className="text-center mt-8">Cargando usuarios...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                Gestión de Usuarios
            </h1>

            {/* Controles de Búsqueda y Filtro */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md space-y-4 md:space-y-0">
                {/* Búsqueda */}
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o rol..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full md:w-1/3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                />

                {/* Filtro por Rol */}
                <select
                    value={role}
                    onChange={handleRoleChange}
                    className="w-full md:w-1/4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                >
                    <option value="">Todos los Roles</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>

                {/* Ordenación */}
                <select
                    value={`${sortBy}-${order}`}
                    onChange={handleSortChange}
                    className="w-full md:w-1/4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 text-sm p-0 h-8"
                >
                    <option value="user_id-ASC">Ordenar por ID (asc.)</option>
                    <option value="user_id-DESC">Ordenar por ID (desc.)</option>
                    <option value="username-ASC">Ordenar por Nombre (asc.)</option>
                    <option value="username-DESC">Ordenar por Nombre (desc.)</option>
                    <option value="email-ASC">Ordenar por Email (asc.)</option>
                    <option value="email-DESC">Ordenar por Email (desc.)</option>
                </select>

                <div className="flex justify-end">
                    <button
                        onClick={handleOpenCreateModal}
                        className="text-white font-bold py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-sm hover:from-blue-600 hover:to-indigo-700"
                    >
                        Crear Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {users.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Nombre de Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.user_id || `user-row-${Math.random()}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.user_id || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.username || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.full_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                aria-label={`Ver usuario ${user.user_id}`}
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-green-600 hover:text-green-900"
                                                aria-label={`Editar usuario ${user.user_id}`}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/usuarios/${user.user_id}/historial`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                aria-label={`Ver historial de préstamos de ${user.user_id}`}
                                            >
                                                Historial
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="p-6 text-center text-gray-500">No se encontraron usuarios.</p>
                )}
            </div>

            {/* Controles de Paginación */}
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
            
            {/* Renderizado condicional de los modales */}
            <ViewUserModal 
                isOpen={isViewModalOpen} 
                user={selectedUser} 
                onClose={handleCloseViewModal} 
            />
            <EditUserModal 
                isOpen={isEditModalOpen} 
                user={selectedUser} 
                onClose={handleCloseEditModal} // Ahora se usa la función de cierre específica
                onUpdate={handleUpdateUser} // `onUpdate` sigue llamando a `handleUpdateUser`
            />

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
};

export default IndexUser;