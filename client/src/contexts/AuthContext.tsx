import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { setHouse } = useTheme();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me');
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity, // don't auto-refetch unnecessarily
  });

  // Sync house theme when user changes
  useEffect(() => {
    if (user && user.house) {
      setHouse(user.house);
    } else if (user === null && !isLoading) {
      setHouse('none');
    }
  }, [user, isLoading, setHouse]);

  const login = async (email: string, password?: string) => {
    await api.post('/auth/login', { email, password });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
    }
  };

  return (
    <AuthContext.Provider value={{ user: user || null, login, logout, isLoading }}>
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
