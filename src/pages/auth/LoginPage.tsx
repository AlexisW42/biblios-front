// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import '@radix-ui/themes/styles.css';
import { Card, Flex, Text, TextField, Button, Heading } from '@radix-ui/themes';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const login = useAuthStore((state) => state.login);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setLoginError('Login failed. Invalid credentials.');
        }
    };

    if (isAuthenticated) {
        return <Text>Ya has iniciado sesión...</Text>;
    }

    return (
        <Flex align="center" justify="center" style={{ height: '100vh' }}>
            <Card size="3" style={{ minWidth: 350 }}>
                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="3">
                        <Heading size="4" align="center">Ingresar a Biblios</Heading>
                        <TextField.Root 
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required>
                        </TextField.Root>
                        <TextField.Root
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" size="3" color="blue">Ingresar</Button>
                        {loginError && <Text color="red">{loginError}</Text>}
                    </Flex>
                </form>
            </Card>
        </Flex>
    );
};

export default LoginPage;