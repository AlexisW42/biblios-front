import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { Button } from '@radix-ui/themes';
import { API_BASE_URL } from '../../utils/constants'; // Assuming this constant is available

interface Location {
  location_id: number | string;
  branch_name: string;
  floor?: string;
  shelf: string;
}

// Component to create a new book record
const CreateBookForm: React.FC = () => {
  // State to hold form data
  const [bookData, setBookData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publish_year: '',
    category: '',
    copies_total: 1,
    location_id: '', // This will hold the selected location_id
  });

  // State to hold location data for the dropdown
  const [locations, setLocations] = useState<Location[]>([]);
  // State for form submission status or error messages
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For loading locations
 
  // Effect to load locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Use axios.get for fetching data
        const response = await axios.get<Location[]>(`${API_BASE_URL}/locations`);
        setLocations(response.data);
      } catch (error) {
        // Axios errors have a response object if it's an HTTP error
        const errorMessage = axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'An unknown error occurred while fetching locations.';
        console.error('Error fetching locations:', errorMessage);
        setMessage('Failed to load locations. Please check the backend server.');
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Handle input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle change for Radix Select component
  const handleLocationChange = (value: string) => {
    setBookData((prevData) => ({
      ...prevData,
      location_id: value,
    }));
  };

  // Handle form submission 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsError(false); // Reset error status

    // Basic client-side validation
    if (!bookData.isbn || !bookData.title || !bookData.author || !bookData.location_id) {
      setMessage('Por favor, completa todos los campos obligatorios (ISBN, Título, Autor, Ubicación).');
      setIsError(true);
      return;
    }

    try {
      // Use axios.post for submitting data
      const response = await axios.post(`${API_BASE_URL}/books`, bookData);

      const result = response.data; // Axios puts the response data directly in .data
      setMessage(`Libro "${result.book.title}" creado exitosamente!`);
      setIsError(false);
      // Clear form fields after successful submission 
      setBookData({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publish_year: '',
        category: '',
        copies_total: 1,
        location_id: '',
      });
    } catch (error) {
      // Axios errors have a response object if it's an HTTP error
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'An unknown error occurred while creating the book.';
      console.error('Error submitting book data:', errorMessage);
      setMessage(`Error: ${errorMessage}`);
      setIsError(true);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl border border-gray-200 mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Registrar Nuevo Libro</h2>

      <Form.Root className="space-y-5" onSubmit={handleSubmit}>
        {/* ISBN Field */}
        <Form.Field name="isbn" className="grid">
          <div className="flex items-baseline justify-between">
            <Form.Label asChild>
              <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
                ISBN <span className="text-red-500">*</span>
              </Label.Root>
            </Form.Label>
            <Form.Message className="text-xs text-red-500 opacity-[0.8]" match="valueMissing">
              Por favor, introduce el ISBN
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="text"
              required
              value={bookData.isbn}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Title Field */}
        <Form.Field name="title" className="grid">
          <div className="flex items-baseline justify-between">
            <Form.Label asChild>
              <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
                Título <span className="text-red-500">*</span>
              </Label.Root>
            </Form.Label>
            <Form.Message className="text-xs text-red-500 opacity-[0.8]" match="valueMissing">
              Por favor, introduce el título
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="text"
              required
              value={bookData.title}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Author Field */}
        <Form.Field name="author" className="grid">
          <div className="flex items-baseline justify-between">
            <Form.Label asChild>
              <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
                Autor <span className="text-red-500">*</span>
              </Label.Root>
            </Form.Label>
            <Form.Message className="text-xs text-red-500 opacity-[0.8]" match="valueMissing">
              Por favor, introduce el autor
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="text"
              required
              value={bookData.author}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Publisher Field */}
        <Form.Field name="publisher" className="grid">
          <Form.Label asChild>
            <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
              Editorial
            </Label.Root>
          </Form.Label>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="text"
              value={bookData.publisher}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Publish Year Field */}
        <Form.Field name="publish_year" className="grid">
          <Form.Label asChild>
            <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
              Año de Publicación
            </Label.Root>
          </Form.Label>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="number"
              min="1000" // Sensible minimum year
              max={new Date().getFullYear()} // Max year is current year
              value={bookData.publish_year}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Category Field */}
        <Form.Field name="category" className="grid">
          <Form.Label asChild>
            <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
              Categoría
            </Label.Root>
          </Form.Label>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="text"
              value={bookData.category}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Copies Total Field */}
        <Form.Field name="copies_total" className="grid">
          <Form.Label asChild>
            <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
              Copias Totales
            </Label.Root>
          </Form.Label>
          <Form.Control asChild>
            <input
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              type="number"
              min="1"
              value={bookData.copies_total}
              onChange={handleChange}
            />
          </Form.Control>
        </Form.Field>

        {/* Location ID Field (Dropdown) */}
        <Form.Field name="location_id" className="grid">
          <div className="flex items-baseline justify-between">
            <Form.Label asChild>
              <Label.Root className="text-sm font-medium text-gray-700 leading-none mb-1">
                Ubicación <span className="text-red-500">*</span>
              </Label.Root>
            </Form.Label>
            <Form.Message className="text-xs text-red-500 opacity-[0.8]" match="valueMissing">
              Por favor, selecciona una ubicación
            </Form.Message>
          </div>
          <Select.Root value={bookData.location_id} onValueChange={handleLocationChange} required>
            <Select.Trigger
              className="flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out data-[placeholder]:text-gray-400"
              aria-label="Ubicación"
              disabled={isLoading || locations.length === 0}
            >
              <Select.Value
                placeholder={
                  isLoading ? 'Cargando ubicaciones...' : locations.length === 0 ? 'No hay ubicaciones disponibles' : 'Selecciona una ubicación'
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
                  {isLoading && (
                    <div className="px-3 py-2 text-gray-500 text-sm">Cargando...</div>
                  )}
                  {!isLoading && locations.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">No hay ubicaciones disponibles</div>
                  )}
                  {!isLoading &&
                    locations.length > 0 &&
                    locations.map((loc) => (
                      <Select.Item
                        key={loc.location_id}
                        value={String(loc.location_id)}
                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-indigo-50 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 outline-none cursor-pointer"
                      >
                        <Select.ItemText>
                          {loc.branch_name} ({loc.floor ? `${loc.floor}, ` : ''}{loc.shelf})
                        </Select.ItemText>
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
        </Form.Field>

        {/* Submission message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center text-sm font-medium ${
              isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <Form.Submit asChild>
          <Button
            className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out font-semibold"
            disabled={isLoading} // Disable if locations are still loading
          >
            {isLoading ? 'Cargando formulario...' : 'Registrar Libro'}
          </Button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default CreateBookForm;
