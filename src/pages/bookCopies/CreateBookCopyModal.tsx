import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Form from '@radix-ui/react-form';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import useAuthStore from '../../stores/authStore';
import { Button } from '@radix-ui/themes';
import type { BookCopy } from '../../types';

interface CreateBookCopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    bookId: string | undefined; // El ID del libro es esencial
}

const CreateBookCopyModal: React.FC<CreateBookCopyModalProps> = ({ isOpen, onClose, onUpdate, bookId }) => {
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    const [copyData, setCopyData] = useState({
        barcode: '',
        status: 'available',
        acquisitionDate: '',
    });

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);

    // Resetea el estado del formulario cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            setCopyData({
                barcode: '',
                status: 'available',
                acquisitionDate: '',
            });
            setMessage('');
            setIsError(false);
        }
    }, [isOpen]);

    // Genera el código de barras por defecto cuando se abre el modal
    useEffect(() => {
        if (isOpen && bookId) {
            const generateBarcode = async () => {
                setIsGeneratingBarcode(true);
                setCopyData(prev => ({ ...prev, barcode: '' })); // Limpia el código de barras anterior
                try {
                    const response = await axiosPrivate.get<BookCopy[]>(`/books/${bookId}/copies`);
                    const copies = response.data;
                    
                    let lastCopyNumber = 0;
                    if (copies.length > 0) {
                        const copyNumbers = copies
                            .map(copy => {
                                // Extrae el número de "BARCODE_BOOKID_NUMBER"
                                const parts = copy.barcode.split('_');
                                if (parts.length > 2 && parts[0] === 'BARCODE' && parts[1] === bookId) {
                                    return parseInt(parts[parts.length - 1], 10);
                                }
                                return NaN;
                            })
                            .filter(num => !isNaN(num));

                        if (copyNumbers.length > 0) {
                            lastCopyNumber = Math.max(...copyNumbers);
                        }
                    }
                    
                    const newBarcode = `BARCODE_${bookId}_${lastCopyNumber + 1}`;
                    setCopyData(prev => ({ ...prev, barcode: newBarcode }));

                } catch (error) {
                    // Si falla la obtención de copias (ej. 404 para un libro nuevo sin copias), se empieza en 1
                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                         const newBarcode = `BARCODE_${bookId}_1`;
                         setCopyData(prev => ({ ...prev, barcode: newBarcode }));
                    } else {
                        console.error('Error generando el código de barras:', error);
                        // Permite que el usuario lo ingrese manualmente
                    }
                } finally {
                    setIsGeneratingBarcode(false);
                }
            };

            generateBarcode();
        }
    }, [isOpen, bookId, axiosPrivate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCopyData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        if (!bookId || !copyData.barcode) {
            setMessage('El código de barras es un campo requerido.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                bookId: parseInt(bookId, 10),
                barcode: copyData.barcode,
                status: copyData.status,
                acquisitionDate: copyData.acquisitionDate || null, // Enviar null si está vacío
            };
            
            await axiosPrivate.post(`${API_BASE_URL}/book-copies`, payload);

            setMessage('¡Copia creada exitosamente!');
            setIsError(false);
            onUpdate(); // Refresca la lista de copias
            onClose(); // Cierra el modal

        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Error al crear la copia.'
                : 'Ocurrió un error inesperado al crear la copia.';
            console.error('Error submitting copy data:', errorMessage);
            setMessage(`Error: ${errorMessage}`);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 ease-out">
            <div className="relative p-6 w-full max-w-lg bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-95 md:scale-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Añadir Nueva Copia</h2>

                <Form.Root className="space-y-4" onSubmit={handleSubmit}>
                    <Form.Field name="barcode">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">Código de Barras <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">Por favor, introduce el código de barras</Form.Message>
                        </div>
                        <Form.Control asChild>
                            <input 
                                type="text" 
                                required 
                                name="barcode" 
                                value={copyData.barcode} 
                                onChange={handleChange} 
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder={isGeneratingBarcode ? 'Generando código...' : ''}
                                disabled={isGeneratingBarcode || isSubmitting}
                            />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="status">
                        <Form.Label className="text-sm font-medium text-gray-700">Estado</Form.Label>
                        <Form.Control asChild>
                             <select name="status" value={copyData.status} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled={isSubmitting}>
                                <option value="available">Disponible</option>
                                <option value="loaned">Prestado</option>
                                <option value="maintenance">En Mantenimiento</option>
                                <option value="lost">Perdido</option>
                            </select>
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="acquisitionDate">
                        <Form.Label className="text-sm font-medium text-gray-700">Fecha de Adquisición</Form.Label>
                        <Form.Control asChild><input type="date" name="acquisitionDate" value={copyData.acquisitionDate} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled={isSubmitting} /></Form.Control>
                    </Form.Field>

                    {message && <div className={`p-3 rounded-md text-center text-sm ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{message}</div>}
                    
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button type="button" onClick={onClose} variant="soft" color="gray" disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Añadiendo...' : 'Añadir Copia'}</Button>
                    </div>
                </Form.Root>
            </div>
        </div>
    );
};

export default CreateBookCopyModal;