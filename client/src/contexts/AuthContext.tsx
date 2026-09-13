import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTheme, type House } from '../components/ThemeProvider';
import { api } from '../lib/api';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name: string;
  house: House;
  role: Role;
  points: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setHouse } = useTheme();

  useEffect(() => {
    // Check session on mount
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        setHouse(data.house);
      } catch (err) {
        setUser(null);
        setHouse('none');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [setHouse]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      // Fetch user profile after successful login
      const { data } = await api.get('/auth/me');
      setUser(data);
      setHouse(data.house);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      setHouse('none');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
