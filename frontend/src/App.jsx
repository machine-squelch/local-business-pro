import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessList from './pages/BusinessList';
import BusinessDetail from './pages/BusinessDetail';
import LocationList from './pages/LocationList';
import LocationDetail from './pages/LocationDetail';
import TemplateGallery from './pages/TemplateGallery';
import DesignEditor from './pages/DesignEditor';
import DesignList from './pages/DesignList';
import DesignDetail from './pages/DesignDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Guards
import PrivateRoute from './components/guards/PrivateRoute';
import PublicRoute from './components/guards/PublicRoute';

// Styles
import './styles/main.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-logo">
            <h1 className="text-gradient">LocalBrand Pro</h1>
          </div>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>

            {/* Private routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/businesses" element={<BusinessList />} />
                <Route path="/businesses/:id" element={<BusinessDetail />} />
                <Route path="/locations" element={<LocationList />} />
                <Route path="/locations/:id" element={<LocationDetail />} />
                <Route path="/templates" element={<TemplateGallery />} />
                <Route path="/designs" element={<DesignList />} />
                <Route path="/designs/:id" element={<DesignDetail />} />
                <Route path="/editor/:id" element={<DesignEditor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
