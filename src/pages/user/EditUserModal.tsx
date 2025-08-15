import React, { useState, useEffect } from 'react';
import type { User } from '../../types/auth';
import { X } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.user_id) {
            setError('Error: El usuario no es válido.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                fullName: formData.full_name,
                role: formData.role,
            };

            await axiosPrivate.put(`/users/${formData.user_id}`, payload);
            
            onUpdate();
            onClose();
        } catch (err: any) {
            console.error('Error updating user:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
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
                    relative p-6 w-full max-w-lg bg-white rounded-xl shadow-lg
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
                {formData ? (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Usuario</h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Nombre de Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
                                Nombre Completo
                            </label>
                            <input
                                id="full_name"
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                                Rol
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
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
                    <p className="text-center text-gray-500">No se ha seleccionado un usuario para editar.</p>
                )}
            </div>
        </div>
    );
};

export default EditUserModal;