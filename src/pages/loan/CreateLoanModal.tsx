import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../stores/authStore';
import { API_BASE_URL } from '../../utils/constants';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';

interface User {
  user_id: number;
  full_name: string;
}

interface BookCopy {
  copy_id: number;
  book: {
    book_id: number;
    title: string;
    isbn: string;
  };
}

interface CreateLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const CreateLoanModal: React.FC<CreateLoanModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);
    const [users, setUsers] = useState<User[]>([]);
    const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedCopyId, setSelectedCopyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchInitialData = async () => {
                setLoading(true);
                try {
                    const usersResponse = await axiosPrivate.get<User[]>(`${API_BASE_URL}/users`);
                    setUsers(usersResponse.data.data);

                    const copiesResponse = await axiosPrivate.get<BookCopy[]>(`${API_BASE_URL}/book-copies/available`);
                    setAvailableCopies(copiesResponse.data);

                    setMessage('');
                    setIsError(false);
                } catch (error) {
                    console.error('Error fetching initial data:', error);
                    setMessage('Error al cargar usuarios o libros disponibles.');
                    setIsError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [isOpen, axiosPrivate]);

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        if (!selectedUserId || !selectedCopyId) {
            setMessage('Por favor, selecciona un usuario y una copia de libro.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                user_id: parseInt(selectedUserId),
                copy_id: parseInt(selectedCopyId),
            };

            await axiosPrivate.post(`${API_BASE_URL}/loans`, payload);
            setMessage('Préstamo creado exitosamente.');
            setIsError(false);
            onUpdate(); // Notifica al componente padre para que se actualice la lista
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Error inesperado al crear el préstamo.';
            console.error('Error creating loan:', errorMessage);
            setMessage(`Error: ${errorMessage}`);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
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
                    disabled={isSubmitting}
                >
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Préstamo</h2>

                <Form.Root onSubmit={handleCreateLoan}>
                    <Form.Field name="user">
                        <div className="mb-4">
                            <Form.Label className="block text-sm font-medium text-gray-700">Usuario <span className="text-red-500">*</span></Form.Label>
                            <Select.Root
                                value={selectedUserId}
                                onValueChange={(value) => setSelectedUserId(value)}
                                required
                            >
                                <Select.Trigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" disabled={loading || isSubmitting}>
                                    <Select.Value placeholder={loading ? "Cargando usuarios..." : "Selecciona un usuario"} />
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Viewport>
                                        {users.map(user => (
                                            <Select.Item key={user.user_id} value={String(user.user_id)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                                <Select.ItemText>{user.full_name}</Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Root>
                        </div>
                    </Form.Field>

                    <Form.Field name="book">
                        <div className="mb-6">
                            <Form.Label className="block text-sm font-medium text-gray-700">Libro <span className="text-red-500">*</span></Form.Label>
                            <Select.Root
                                value={selectedCopyId}
                                onValueChange={(value) => setSelectedCopyId(value)}
                                required
                            >
                                <Select.Trigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" disabled={loading || isSubmitting}>
                                    <Select.Value placeholder={loading ? "Cargando libros..." : "Selecciona un libro"} />
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Viewport>
                                        {availableCopies.map(copy => (
                                            <Select.Item key={copy.copy_id} value={String(copy.copy_id)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                                <Select.ItemText>{copy.book.title} (ISBN: {copy.book.isbn})</Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Root>
                        </div>
                    </Form.Field>

                    {message && (
                        <p className={`mb-4 text-sm text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? 'Creando...' : 'Crear Préstamo'}
                        </button>
                    </div>
                </Form.Root>
            </div>
        </div>
    );
};

export default CreateLoanModal;