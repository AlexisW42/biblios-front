export interface User {
    user_id: number | null;
    username: string | null;
    full_name: string;
    email: string;
    role: "admin" | "user" | "guest"; // Assuming possible roles, adjust if needed
    created_at: string; // Or Date if you plan to convert it
    updated_at: string; // Or Date if you plan to convert it
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