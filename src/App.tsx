import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import AppRouter from './routes/AppRouter';

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="App">
            <AppRouter />
        </div>
    );
}

export default App;