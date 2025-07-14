// src/pages/ProtectedPage.tsx
import React, { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';

const ProtectedPage: React.FC = () => {
    const { user, axiosPrivate } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                const response = await axiosPrivate.get('/users/protected');
                setData(response.data);
            } catch (err: any) {
                if (err.response?.status === 403 || err.response?.status === 401) {
                    setError('You are not authorized to view this content. Please log in.');
                } else {
                    setError('Failed to fetch protected data. Please try again.');
                }
                console.error('Protected data fetch error:', err);
            }
        };
        fetchProtectedData();
    }, [axiosPrivate]);

    return (
        <div>
            <h2>Protected Page</h2>
            {user && <p>Welcome, {user.username || 'Authenticated User'}!</p>}
            {data && (
                <div>
                    <h3>Data from Protected Endpoint:</h3>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ProtectedPage;