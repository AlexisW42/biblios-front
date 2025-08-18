import React, { useState, useRef } from 'react';
import useAuthStore from '../../stores/authStore';
import { Button, Flex, Heading, Card, Text, Callout } from '@radix-ui/themes';
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

const IndexBackup: React.FC = () => {
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [loadingRestore, setLoadingRestore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const axiosPrivate = useAuthStore((state) => state.axiosPrivate);

    const handleDownload = async () => {
        setLoadingDownload(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await axiosPrivate.get('/backup/download', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'biblios_backup.sql'; // Default filename
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccess('Backup descargado exitosamente.');
        } catch (err) {
            setError('Error al descargar el backup. Asegúrate de tener permisos de administrador.');
            console.error(err);
        } finally {
            setLoadingDownload(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setError(null);
            setSuccess(null);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo para restaurar.');
            return;
        }

        const confirmRestore = window.confirm(
            '¿Estás seguro de que quieres restaurar la base de datos con este archivo? Esta acción es irreversible y sobreescribirá todos los datos actuales.'
        );

        if (!confirmRestore) {
            return;
        }

        setLoadingRestore(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('backup', selectedFile);

        try {
            await axiosPrivate.post('/backup/restore', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Backup restaurado exitosamente. La aplicación podría necesitar reiniciarse.');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError('Error al restaurar el backup. Verifica el archivo y tus permisos.');
            console.error(err);
        } finally {
            setLoadingRestore(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <Flex justify="between" align="center" mb="6">
                    <Heading>Gestión de Copias de Seguridad</Heading>
                </Flex>

                {success && (
                    <Callout.Root color="green" role="alert" mb="4">
                        <Callout.Icon>
                            <CheckCircle />
                        </Callout.Icon>
                        <Callout.Text>{success}</Callout.Text>
                    </Callout.Root>
                )}
                {error && (
                    <Callout.Root color="red" role="alert" mb="4">
                        <Callout.Icon>
                            <AlertTriangle />
                        </Callout.Icon>
                        <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <Card>
                        <Heading as="h2" size="4" mb="2">Descargar Backup</Heading>
                        <Text as="p" size="2" color="gray" mb="4">
                            Crea y descarga un backup completo de la base de datos en formato SQL. Guarda este archivo en un lugar seguro.
                        </Text>
                        <Button onClick={handleDownload} disabled={loadingDownload} size="2">
                            <Download className="h-4 w-4" />
                            {loadingDownload ? 'Generando...' : 'Descargar Backup'}
                        </Button>
                    </Card>

                    <Card>
                        <Heading as="h2" size="4" mb="2">Restaurar Backup</Heading>
                        <Text as="p" size="2" color="gray" mb="4">
                            Restaura la base de datos desde un archivo <code>.sql</code>.
                            <strong className="text-red-600 block mt-1">
                                ¡Atención! Esta acción es irreversible y sobreescribirá todos los datos actuales.
                            </strong>
                        </Text>
                        <Flex direction="column" gap="3">
                            <label className="w-full">
                                <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm text-gray-600">
                                        {selectedFile ? selectedFile.name : 'Seleccionar archivo...'}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".sql"
                                        className="hidden"
                                    />
                                </div>
                            </label>
                            <Button onClick={handleRestore} disabled={!selectedFile || loadingRestore} color="red" size="2">
                                <Upload className="h-4 w-4" />
                                {loadingRestore ? 'Restaurando...' : 'Restaurar y Sobreescribir'}
                            </Button>
                        </Flex>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IndexBackup;