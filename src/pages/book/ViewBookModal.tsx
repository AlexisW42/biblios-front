// src/components/books/ViewBookModal.tsx

import React from 'react';
import type { Book } from '../../types';
import { Book as BookIcon, X } from 'lucide-react';

interface ViewBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book | null;
}

const ViewBookModal: React.FC<ViewBookModalProps> = ({ isOpen, onClose, book }) => {
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
                {book ? (
                    <>
                        <div className="flex items-center space-x-3 mb-6">
                            <BookIcon className="w-8 h-8 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Detalles del Libro</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p><strong>ISBN:</strong> {book.isbn}</p>
                            <p><strong>Título:</strong> {book.title}</p>
                            <p><strong>Autor:</strong> {book.author}</p>
                            <p><strong>Editorial:</strong> {book.publisher || 'N/A'}</p>
                            <p><strong>Año de Publicación:</strong> {book.publish_year || 'N/A'}</p>
                            <p><strong>Categoría:</strong> {book.category || 'N/A'}</p>
                            <p><strong>Copias Totales:</strong> {book.copies_total}</p>
                            <p><strong>Ubicación:</strong> {book.location?.branch_name}, {book.location?.shelf}</p>
                            <p><strong>Carreras:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                                {book.majors && book.majors.length > 0 ? (
                                    book.majors.map((major, index) => (
                                        <li key={index}>{major.name}</li>
                                    ))
                                ) : (
                                    <li>N/A</li>
                                )}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">No se ha seleccionado ningún libro.</p>
                )}
            </div>
        </div>
    );
};

export default ViewBookModal;