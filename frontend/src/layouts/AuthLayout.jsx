// layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const AuthLayout = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`auth-layout ${darkMode ? 'dark' : ''}`}>
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="text-gradient">LocalBrand Pro</h1>
          <p>Professional marketing materials for local businesses</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
      <div className="auth-background">
        <div className="bg-gradient-primary"></div>
      </div>
    </div>
  );
};

export default AuthLayout;