import React, { useState, useEffect, useRef } from 'react';
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
    copyId: number | null; // Nuevo prop
}

const CreateLoanModal: React.FC<CreateLoanModalProps> = ({ isOpen, onClose, onUpdate, copyId }) => {
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loanDate, setLoanDate] = useState<string>(() => {
        const today = new Date();
        return getLocalDateString(today);
    });
    const [dueDate, setDueDate] = useState<string>(() => {
        const due = new Date();
        due.setDate(due.getDate() + 7);
        return getLocalDateString(due);
    });
    const modalRef = useRef<HTMLDivElement>(null); // Referencia al modal

    function getLocalDateString(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const usersResponse = await axiosPrivate.get<User[]>(`${API_BASE_URL}/users`);
                    setUsers(usersResponse.data.data);
                    setMessage('');
                    setIsError(false);
                } catch (error) {
                    setMessage('Error al cargar usuarios.');
                    setIsError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen, axiosPrivate]);

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        if (!selectedUserId || !copyId || !loanDate || !dueDate) {
            setMessage('Por favor, completa todos los campos.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                userId: parseInt(selectedUserId),
                copyId: copyId,
                loanDate: loanDate,
                dueDate: dueDate,
            };

            await axiosPrivate.post(`${API_BASE_URL}/loans`, payload);
            setMessage('Préstamo creado exitosamente.');
            setIsError(false);
            onUpdate();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Error inesperado al crear el préstamo.';
            setMessage(`Error: ${errorMessage}`);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div ref={modalRef} className={`relative p-6 w-full max-w-lg bg-white rounded-xl shadow-lg transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Préstamo</h2>
                <Form.Root onSubmit={handleCreateLoan}>
                    {/* Usuario */}
                    <Form.Field name="user">
                      <div className="mb-4">
                        <Form.Label className="block text-sm font-medium text-gray-700">
                          Usuario <span className="text-red-500">*</span>
                        </Form.Label>
                        <Select.Root
                          value={selectedUserId}
                          onValueChange={(value) => setSelectedUserId(value)}
                          required
                        >
                          <Select.Trigger
                            className="flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out data-[placeholder]:text-gray-400"
                            aria-label="Usuario"
                            disabled={loading || users.length === 0 || isSubmitting}
                          >
                            <Select.Value
                              placeholder={
                                loading ? 'Cargando usuarios...' : users.length === 0 ? 'No hay usuarios disponibles' : 'Selecciona un usuario'
                              }
                            />
                            <Select.Icon className="ml-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
                              <Select.Viewport className="p-1">
                                {loading && (
                                  <div className="px-3 py-2 text-gray-500 text-sm">Cargando...</div>
                                )}
                                {!loading && users.length === 0 && (
                                  <div className="px-3 py-2 text-gray-500 text-sm">No hay usuarios disponibles</div>
                                )}
                                {!loading &&
                                  users.length > 0 &&
                                  users.map((user) => (
                                    <Select.Item
                                      key={user.user_id}
                                      value={String(user.user_id)}
                                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-indigo-50 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 outline-none cursor-pointer"
                                    >
                                      <Select.ItemText>{user.full_name}</Select.ItemText>
                                      <Select.ItemIndicator>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-indigo-600"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  ))
                                }
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </div>
                    </Form.Field>
                    {/* Fecha de préstamo */}
                    <Form.Field name="loanDate">
                        <div className="mb-4">
                            <Form.Label className="block text-sm font-medium text-gray-700">
                                Fecha de préstamo <span className="text-red-500">*</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={loanDate}
                                    onChange={e => setLoanDate(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </Form.Control>
                        </div>
                    </Form.Field>
                    {/* Fecha de vencimiento */}
                    <Form.Field name="dueDate">
                        <div className="mb-4">
                            <Form.Label className="block text-sm font-medium text-gray-700">
                                Fecha de vencimiento <span className="text-red-500">*</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </Form.Control>
                        </div>
                    </Form.Field>
                    {message && (
                        <p className={`mb-4 text-sm text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50" disabled={isSubmitting || loading}>
                            {isSubmitting ? 'Creando...' : 'Crear Préstamo'}
                        </button>
                    </div>
                </Form.Root>
            </div>
        </div>
    );
};

export default CreateLoanModal;