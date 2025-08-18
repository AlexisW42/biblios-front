import React from 'react';
import type { Location } from '../../types'; // Asume que tienes un tipo 'Location' definido
import { MapPin, X } from 'lucide-react'; // Usamos un ícono de MapPin para la ubicación

// Define la estructura para el tipo de datos de Ubicación, si no está en un archivo de tipos
interface Location {
    location_id: number;
    branch_name: string;
    floor?: string;
    shelf?: string;
    description?: string;
    books?: any[]; // Incluimos un array opcional para los libros asociados
}

interface ViewLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: Location | null;
}

const ViewLocationModal: React.FC<ViewLocationModalProps> = ({ isOpen, onClose, location }) => {
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
                {location ? (
                    <>
                        <div className="flex items-center space-x-3 mb-6">
                            <MapPin className="w-8 h-8 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Detalles de la Ubicación</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p><strong>ID:</strong> {location.location_id}</p>
                            <p><strong>Sucursal:</strong> {location.branch_name}</p>
                            <p><strong>Piso:</strong> {location.floor || 'N/A'}</p>
                            <p><strong>Estantería:</strong> {location.shelf || 'N/A'}</p>
                            <p><strong>Descripción:</strong> {location.description || 'N/A'}</p>
                            
                            {/* Opcional: Lista de libros asociados si la API los devuelve */}
                            <p><strong>Libros Asociados:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                                {location.books && location.books.length > 0 ? (
                                    location.books.map((book, index) => (
                                        <li key={index}>{book.title}</li>
                                    ))
                                ) : (
                                    <li>No hay libros asociados a esta ubicación.</li>
                                )}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">No se ha seleccionado ninguna ubicación.</p>
                )}
            </div>
        </div>
    );
};

export default ViewLocationModal;
