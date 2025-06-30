import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Styles
import './styles/main.css';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
