import React from 'react';
import type { User } from '../../types/auth';
import { X, User as UserIcon } from 'lucide-react';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
    // El modal siempre se renderiza, pero su visibilidad es controlada por clases.
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
                {user ? (
                    <>
                    <div className="flex flex-col items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <UserIcon className="h-10 w-10 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{user.full_name}</h2>
                        <span className="text-sm text-gray-500 italic">@{user.username || 'N/A'}</span>
                    </div>

                    <div className="space-y-3 text-gray-700">
                        <div>
                            <p className="text-sm font-semibold">ID:</p>
                            <p className="text-sm font-normal">{user.user_id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Email:</p>
                            <p className="text-sm font-normal">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Rol:</p>
                            <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.role === 'admin'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Creado en:</p>
                            <p className="text-sm font-normal">{new Date(user.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Última actualización:</p>
                            <p className="text-sm font-normal">{new Date(user.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">No se ha seleccionado ningún usuario.</p>
                )}
            </div>
        </div>
    );
};

export default ViewUserModal;