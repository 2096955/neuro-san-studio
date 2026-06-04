import { useState, useEffect } from 'react';

export interface UseThemeReturn {
  darkMode: boolean;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme based on system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setDarkMode(shouldUseDarkMode);
    
    // Apply initial theme to document
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply dark class to document root for global theme changes
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return {
    darkMode,
    toggleTheme,
  };
}
