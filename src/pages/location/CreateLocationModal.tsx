import React, { useState } from 'react';
import axios from 'axios';
import * as Form from '@radix-ui/react-form';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants'; // Assuming this constant is available
import useAuthStore from '../../stores/authStore';
import { Button } from '@radix-ui/themes';

// Define la estructura para el tipo de datos de Ubicación.
// Esto asume que tienes un archivo de tipos o lo defines aquí.
interface Location {
    location_id: number;
    branch_name: string;
    floor?: string;
    shelf?: string;
    description?: string;
}

interface CreateLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const CreateLocationModal: React.FC<CreateLocationModalProps> = ({ isOpen, onClose, onUpdate }) => {
    // Hook para obtener la instancia de axios autenticada
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    // Estado para los datos de la nueva ubicación
    const [locationData, setLocationData] = useState({
        branch_name: '',
        floor: '',
        shelf: '',
        description: ''
    });

    // Estados para el manejo de la UI y mensajes
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Maneja los cambios en los campos de entrada del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocationData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Maneja el envío del formulario para crear la ubicación
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        // Validación simple
        if (!locationData.branch_name) {
            setMessage('El nombre de la sucursal (branch_name) es requerido.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            // Envía la solicitud POST al endpoint de creación de ubicaciones
            await axiosPrivate.post(`${API_BASE_URL}/locations`, locationData);

            setMessage(`Ubicación creada exitosamente!`);
            setIsError(false);
            onUpdate(); // Llama a la función de actualización para recargar la lista
            onClose(); // Cierra el modal

            // Restablece el formulario después de un envío exitoso
            setLocationData({
                branch_name: '',
                floor: '',
                shelf: '',
                description: ''
            });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Error al crear la ubicación.'
                : 'Ocurrió un error inesperado al crear la ubicación.';
            console.error('Error submitting location data:', errorMessage);
            setMessage(`Error: ${errorMessage}`);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Si el modal no está abierto, no renderiza nada
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 ease-out">
            <div className="relative p-6 w-full max-w-lg bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-95 md:scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Registrar Nueva Ubicación</h2>

                <Form.Root className="space-y-4" onSubmit={handleSubmit}>
                    {/* Campo de Nombre de Sucursal */}
                    <Form.Field name="branch_name">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">Nombre de Sucursal <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">
                                Por favor, introduce el nombre
                            </Form.Message>
                        </div>
                        <Form.Control asChild>
                            <input 
                                type="text" 
                                required 
                                name="branch_name" 
                                value={locationData.branch_name} 
                                onChange={handleChange} 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Campo de Piso */}
                    <Form.Field name="floor">
                        <Form.Label className="text-sm font-medium text-gray-700">Piso</Form.Label>
                        <Form.Control asChild>
                            <input 
                                type="text" 
                                name="floor" 
                                value={locationData.floor} 
                                onChange={handleChange} 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Campo de Estantería */}
                    <Form.Field name="shelf">
                        <Form.Label className="text-sm font-medium text-gray-700">Estantería</Form.Label>
                        <Form.Control asChild>
                            <input 
                                type="text" 
                                name="shelf" 
                                value={locationData.shelf} 
                                onChange={handleChange} 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Campo de Descripción */}
                    <Form.Field name="description">
                        <Form.Label className="text-sm font-medium text-gray-700">Descripción</Form.Label>
                        <Form.Control asChild>
                            <textarea 
                                name="description" 
                                value={locationData.description} 
                                onChange={handleChange} 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Mensajes de estado */}
                    {message && (
                        <div className={`p-3 rounded-md text-center text-sm ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {message}
                        </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar Ubicación'}
                        </Button>
                    </div>
                </Form.Root>
            </div>
        </div>
    );
};

export default CreateLocationModal;
