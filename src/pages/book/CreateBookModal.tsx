import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants'; // Assuming this constant is available
import useAuthStore from '../../stores/authStore';
import { Button } from '@radix-ui/themes';

// Define la estructura de la respuesta de la API con paginación para ubicaciones
interface PaginatedLocationsResponse {
    data: Location[];
    total: number;
    page: number;
    limit: number;
}

interface Location {
  location_id: number | string;
  branch_name: string;
  floor?: string;
  shelf?: string;
}

interface CreateBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);
    const [bookData, setBookData] = useState({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publish_year: '',
        category: '',
        copies_total: 1,
        location_id: '',
        majors: [] as string[]
    });

    const [locations, setLocations] = useState<Location[]>([]);
    const [majors, setMajors] = useState<{ majorId: number; name: string }[]>([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchInitialData = async () => {
                setIsLoading(true);
                try {
                    // Cuidado aquí: la API de ubicaciones devuelve un objeto con un campo 'data'
                    const locationsResponse = await axiosPrivate.get<PaginatedLocationsResponse>(`${API_BASE_URL}/locations?limit=1000`); // Aumentamos el límite para obtener todas las ubicaciones
                    setLocations(locationsResponse.data.data); // Accede a la propiedad 'data'

                    const majorsResponse = await axiosPrivate.get<{ majorId: number; name: string }[]>(`${API_BASE_URL}/majors`);
                    setMajors(majorsResponse.data);

                    setMessage('');
                    setIsError(false);
                } catch (error) {
                    const errorMessage = axios.isAxiosError(error)
                        ? error.response?.data?.message || error.message
                        : 'An unknown error occurred while fetching data.';
                    console.error('Error fetching initial data:', errorMessage);
                    setMessage('Failed to load locations or majors. Please check the backend server.');
                    setIsError(true);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [isOpen, axiosPrivate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleLocationChange = (value: string) => {
        setBookData((prevData) => ({
            ...prevData,
            location_id: value,
        }));
    };

    const handleMajorsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.options);
        const selectedMajors = options.filter(option => option.selected).map(option => option.value);
        setBookData(prev => ({
            ...prev,
            majors: selectedMajors
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        if (!bookData.isbn || !bookData.title || !bookData.author || !bookData.location_id) {
            setMessage('Por favor, completa todos los campos obligatorios (ISBN, Título, Autor, Ubicación).');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...bookData,
                publish_year: bookData.publish_year ? parseInt(bookData.publish_year) : undefined,
                copies_total: bookData.copies_total,
                majors: bookData.majors.map(id => parseInt(id))
            };
            
            await axiosPrivate.post(`${API_BASE_URL}/books`, payload);

            setMessage(`Libro creado exitosamente!`);
            setIsError(false);
            onUpdate();
            onClose();

            setBookData({ // Reset form after successful submission
                isbn: '',
                title: '',
                author: '',
                publisher: '',
                publish_year: '',
                category: '',
                copies_total: 1,
                location_id: '',
                majors: []
            });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An unknown error occurred while creating the book.';
            console.error('Error submitting book data:', errorMessage);
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
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Registrar Nuevo Libro</h2>

                <Form.Root className="space-y-4" onSubmit={handleSubmit}>
                    <Form.Field name="isbn">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">ISBN <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">
                                Por favor, introduce el ISBN
                            </Form.Message>
                        </div>
                        <Form.Control asChild>
                            <input type="text" required value={bookData.isbn} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="title">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">Título <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">
                                Por favor, introduce el título
                            </Form.Message>
                        </div>
                        <Form.Control asChild>
                            <input type="text" required value={bookData.title} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="author">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">Autor <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">
                                Por favor, introduce el autor
                            </Form.Message>
                        </div>
                        <Form.Control asChild>
                            <input type="text" required value={bookData.author} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="publisher">
                        <Form.Label className="text-sm font-medium text-gray-700">Editorial</Form.Label>
                        <Form.Control asChild>
                            <input type="text" value={bookData.publisher} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="publish_year">
                        <Form.Label className="text-sm font-medium text-gray-700">Año de Publicación</Form.Label>
                        <Form.Control asChild>
                            <input type="number" min="1000" max={new Date().getFullYear()} value={bookData.publish_year} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="category">
                        <Form.Label className="text-sm font-medium text-gray-700">Categoría</Form.Label>
                        <Form.Control asChild>
                            <input type="text" value={bookData.category} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>
                    
                    <Form.Field name="copies_total">
                        <Form.Label className="text-sm font-medium text-gray-700">Copias Totales</Form.Label>
                        <Form.Control asChild>
                            <input type="number" min="1" value={bookData.copies_total} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="location_id">
                        <div className="flex items-baseline justify-between">
                            <Form.Label className="text-sm font-medium text-gray-700">Ubicación <span className="text-red-500">*</span></Form.Label>
                            <Form.Message className="text-xs text-red-500 opacity-80" match="valueMissing">
                                Por favor, selecciona una ubicación
                            </Form.Message>
                        </div>
                        <Select.Root value={bookData.location_id} onValueChange={handleLocationChange} required>
                            <Select.Trigger className="w-full flex justify-between items-center px-3 py-2 border rounded-md shadow-sm" disabled={isLoading || locations.length === 0}>
                                <Select.Value placeholder={isLoading ? 'Cargando...' : locations.length === 0 ? 'No hay ubicaciones' : 'Selecciona una ubicación'} />
                                <Select.Icon className="ml-2">
                                    {/* Icono */}
                                </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content className="bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                    <Select.Viewport className="p-1">
                                        {locations.map((loc) => (
                                            <Select.Item key={loc.location_id} value={String(loc.location_id)} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                                <Select.ItemText>{loc.branch_name} ({loc.floor ? `${loc.floor}, ` : ''}{loc.shelf})</Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </Form.Field>

                    <div className="mb-4">
                        <Label.Root className="text-sm font-medium text-gray-700">
                            Carreras
                        </Label.Root>
                        <select
                            multiple
                            value={bookData.majors}
                            onChange={handleMajorsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-32"
                        >
                            {majors.map((major) => (
                                <option key={major.majorId} value={major.majorId}>
                                    {major.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-center text-sm ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {message}
                        </div>
                    )}
                    
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
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar Libro'}
                        </Button>
                    </div>
                </Form.Root>
            </div>
        </div>
    );
};

export default CreateBookModal;