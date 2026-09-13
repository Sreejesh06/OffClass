import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type House = 'red' | 'blue' | 'green' | 'purple' | 'none';

interface ThemeContextType {
  house: House;
  setHouse: (house: House) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [house, setHouse] = useState<House>('none');

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

  return (
    <ThemeContext.Provider value={{ house, setHouse }}>
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
