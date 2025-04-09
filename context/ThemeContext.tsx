// context/ThemeContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: DefaultTheme,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
