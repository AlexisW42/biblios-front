import { useEffect } from 'react';

import AppRouter from './routes/AppRouter';
import useAuthStore from './stores/authStore'; // Para inicializar la verificación de autenticación

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    // Ejecutar checkAuth solo una vez al cargar la aplicación
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


// Definimos la interfaz para nuestros datos
// interface DataItem {
//   id: number;
//   name: string;
//   description: string;
// }

// function App() {
//   const [message, setMessage] = useState<string>('');
//   const [apiData, setApiData] = useState<DataItem[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const apiUrl = import.meta.env.VITE_URL_BACKEND;

//    useEffect(() => {
//     // Petición a la ruta raíz del backend con Axios
//     axios.get(apiUrl)
//       .then(response => {
//         setMessage(response.data);
//       })
//       .catch(err => {
//         console.error("Error al obtener el mensaje del backend:", err);
//         setError("No se pudo conectar con el backend o la ruta raíz.");
//       });

//     // Petición a la ruta /api/data del backend con Axios
//     axios.get<DataItem[]>(apiUrl+'/api/data')
//       .then(response => {
//         setApiData(response.data);
//       })
//       .catch(err => {
//         console.error("Error al obtener los datos de la API:", err);
//         setError(prevError => prevError ? `${prevError}\nError al obtener los datos de la API.` : "Error al obtener los datos de la API.");
//       });
//   }, []);

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Aplicación Fullstack React + Express + TypeScript</h1>
//         {error && <p className='text-red-500 font-medium whitespace-pre-wrap'>Error: {error}</p>}
        
//         <h2>Mensaje del Backend (Ruta /):</h2>
//         <p>{message || 'Cargando mensaje...'}</p>

//         <h2>Datos de la API (Ruta /api/data):</h2>
//         {apiData.length > 0 ? (
//           <ul>
//             {apiData.map(item => (
//               <li key={item.id}>
//                 <strong>{item.name}</strong>: {item.description}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>Cargando datos de la API o no hay datos...</p>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;