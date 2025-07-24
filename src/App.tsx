import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppRouter from './routes/AppRouter';
import useAuthStore from './stores/authStore'; // Para inicializar la verificación de autenticación
import Register from "./pages/auth/RegisterPage";
import Login from "./pages/auth/LoginPage";
import { Flex, Text, Button } from "@radix-ui/themes";


function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    // Ejecutar checkAuth solo una vez al cargar la aplicación
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    {/* Agrega más rutas aquí */}
                </Routes>
            </BrowserRouter>
            <AppRouter />
        </div>
    );
}

export default App;