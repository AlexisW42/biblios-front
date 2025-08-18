export interface User {
  user_id: number | null;
  username: string | null;
  full_name: string;
  email: string;
  role: "admin" | "user" | "guest"; // Assuming possible roles, adjust if needed
  created_at: string; // Or Date if you plan to convert it
  updated_at: string; // Or Date if you plan to convert it
}

export interface Book {
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string; // Propiedad opcional
  publish_year?: number; // Propiedad opcional
  category?: string; // Propiedad opcional
  copies_total: number;
  location: Location; // Relación con la interfaz Location
}

export interface BookCopy {
    copy_id: number;
    book: Relation<Book>;
    barcode: string;
    status: 'available' | 'loaned' | 'lost' | 'damaged';
    acquisition_date: string | null; // Usamos string porque la API devuelve un string ISO
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export interface Location {
  location_id: number;
  branch_name: string;
  floor: string | null;
  shelf: string | null;
  description: string | null;
}