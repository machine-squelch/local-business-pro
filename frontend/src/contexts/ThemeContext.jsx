import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6a11cb');
  const [secondaryColor, setSecondaryColor] = useState('#2575fc');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedSecondaryColor = localStorage.getItem('secondaryColor');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }
    if (savedSecondaryColor) {
      setSecondaryColor(savedSecondaryColor);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-gradient-start', primaryColor);
    document.documentElement.style.setProperty('--primary-gradient-end', secondaryColor);
    
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [darkMode, primaryColor, secondaryColor]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const setThemeColors = (primary, secondary) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
  };

  const resetTheme = () => {
    setPrimaryColor('#6a11cb');
    setSecondaryColor('#2575fc');
    setDarkMode(false);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    primaryColor,
    secondaryColor,
    setThemeColors,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};