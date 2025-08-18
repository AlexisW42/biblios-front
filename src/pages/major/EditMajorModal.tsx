import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

interface UniversityMajor {
    majorId: number;
    name: string;
}

interface EditMajorModalProps {
    isOpen: boolean;
    onClose: () => void;
    major: UniversityMajor | null;
    onMajorUpdated: () => void;
}

const EditMajorModal: React.FC<EditMajorModalProps> = ({ isOpen, onClose, major, onMajorUpdated }) => {
    const [name, setName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    useEffect(() => {
        if (major) {
            setName(major.name);
        }
    }, [major]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!major || !major.majorId) {
            setError('Error: La carrera no es válida.');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            await axiosPrivate.put(`/majors/${major.majorId}`, { name });
            onMajorUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar la carrera:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ocurrió un error inesperado. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`
                fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center
                transition-opacity duration-300
                ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
        >
            <div
                className={`
                    relative p-6 w-full max-w-md bg-white rounded-xl shadow-lg
                    transform transition-all duration-300
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                `}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                {major ? (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Carrera</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Nombre de la Carrera
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs italic mb-4">{error}</p>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-gray-500">No se ha seleccionado una carrera para editar.</p>
                )}
            </div>
        </div>
    );
};

export default EditMajorModal;