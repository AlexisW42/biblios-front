import React from 'react';
import { X } from 'lucide-react';

interface UniversityMajor {
    majorId: number;
    name: string;
}

interface ViewMajorModalProps {
    isOpen: boolean;
    onClose: () => void;
    major: UniversityMajor | null;
}

const ViewMajorModal: React.FC<ViewMajorModalProps> = ({ isOpen, onClose, major }) => {
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
                {major ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Detalles de la Carrera</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">ID de la Carrera</h3>
                                <p className="text-gray-600">{major.majorId}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Nombre de la Carrera</h3>
                                <p className="text-gray-600">{major.name}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No se ha seleccionado una carrera para ver.</p>
                )}
            </div>
        </div>
    );
};

export default ViewMajorModal;