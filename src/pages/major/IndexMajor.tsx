import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import { Eye, Edit, Trash2, PlusCircle } from 'lucide-react';
import CreateMajorModal from './CreateMajorModal';
import EditMajorModal from './EditMajorModal';
import ViewMajorModal from './ViewMajorModal';

// Define la estructura de la carrera universitaria
interface UniversityMajor {
    majorId: number;
    name: string;
}

const IndexMajors: React.FC = () => {
    const [majors, setMajors] = useState<UniversityMajor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    // Estados para los modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedMajor, setSelectedMajor] = useState<UniversityMajor | null>(null);

    useEffect(() => {
        const fetchMajors = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get<UniversityMajor[]>('/majors');
                setMajors(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching university majors:', err);
                setError('No se pudieron cargar las carreras universitarias.');
            } finally {
                setLoading(false);
            }
        };

        fetchMajors();
    }, [axiosPrivate, refreshTrigger]);

    // Funciones para manejar la apertura y cierre de modales
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);
    
    const handleOpenEditModal = (major: UniversityMajor) => {
        setSelectedMajor(major);
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedMajor(null);
    };
    
    const handleOpenViewModal = (major: UniversityMajor) => {
        setSelectedMajor(major);
        setIsViewModalOpen(true);
    };
    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedMajor(null);
    };

    // Funciones de acción
    const handleDeleteMajor = async (majorId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
            try {
                await axiosPrivate.delete(`/majors/${majorId}`);
                // Forzar la recarga de la lista
                setRefreshTrigger(prev => prev + 1);
            } catch (err: any) {
                console.error('Error deleting major:', err);
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Error al eliminar la carrera.');
                }
            }
        }
    };

    const handleActionComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        handleCloseCreateModal();
        handleCloseEditModal();
        handleCloseViewModal();
    };

    if (loading) return <p className="text-center mt-8">Cargando carreras...</p>;
    
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Carreras Universitarias</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center space-x-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle size={20} />
                    <span>Añadir Carrera</span>
                </button>
            </div>
            
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Tabla de Carreras */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {majors.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {majors.map((major) => (
                                <tr key={major.majorId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {major.majorId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {major.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button
                                                onClick={() => handleOpenViewModal(major)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Ver detalles"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(major)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Editar"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMajor(major.majorId)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="p-6 text-center text-gray-500">No se encontraron carreras universitarias.</p>
                )}
            </div>

            {/* Modales */}
            <CreateMajorModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onMajorCreated={handleActionComplete}
            />
            <EditMajorModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                major={selectedMajor}
                onMajorUpdated={handleActionComplete}
            />
            <ViewMajorModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                major={selectedMajor}
            />
        </div>
    );
};

export default IndexMajors;