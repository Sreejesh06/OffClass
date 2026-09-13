import { createContext, useContext, useState, type ReactNode } from 'react';
import { useTheme, type House } from '../components/ThemeProvider';

interface User {
  id: string;
  email: string;
  name: string;
  house: House;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setHouse } = useTheme();

  const login = async (email: string) => {
    setIsLoading(true);
    // Mock API call for Phase 1
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Mock assigning a house based on some pseudo-random logic or just default to Blue
        const assignedHouse: House = 'blue';
        setUser({
          id: '123',
          email,
          name: 'Alex Cipher',
          house: assignedHouse
        });
        setHouse(assignedHouse);
        setIsLoading(false);
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    setHouse('none');
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
