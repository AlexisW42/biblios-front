export interface User {
    id: number | null;
    username: string | null;
    //email: string | null;
    // Agrega más propiedades del usuario si las necesitas
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    axiosPrivate: any; // O un tipo más específico para AxiosInstance
}