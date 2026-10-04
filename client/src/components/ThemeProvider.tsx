import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type House = 'red' | 'blue' | 'green' | 'purple' | 'none';

interface ThemeContextType {
  house: House;
  setHouse: (house: House) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [house, setHouse] = useState<House>('none');
  
  // Check local storage or system preference on mount
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme-mode');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme-mode', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-red', 'theme-blue', 'theme-green', 'theme-purple');
    
    // Add the current house theme if it exists
    if (house !== 'none') {
      document.body.classList.add(`theme-${house}`);
    } else {
      // Default fallback for development/public landing page
      document.body.classList.add('theme-red');
    }
  }, [house]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ house, setHouse, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
